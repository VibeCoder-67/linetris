#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    linera_base_types::{Account, Amount, WithContractAbi, TimeDelta, Timestamp},
    views::{RootView, View},
    Contract, ContractRuntime,
};
use stake::{LeaderboardEntry, Operation, StakeInfo};
use self::state::StakeState;

pub struct StakeContract {
    state: StakeState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(StakeContract);

impl WithContractAbi for StakeContract {
    type Abi = stake::StakeAbi;
}

impl Contract for StakeContract {
    type Message = ();
    type Parameters = ();
    type InstantiationArgument = u64; // Duration in microseconds
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = StakeState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        StakeContract { state, runtime }
    }

    async fn instantiate(&mut self, duration: Self::InstantiationArgument) {
        self.runtime.application_parameters();
        self.state.epoch_start.set(self.runtime.system_time());
        self.state.epoch_duration.set(TimeDelta::from_micros(duration));
        self.state.pool_balance.set(Amount::ZERO);
        self.state.leaderboard.set(vec![]);
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::Stake { amount } => {
                let signer = self.runtime.authenticated_signer().expect("Signer required");
                
                // Validate amount ($1, $5, $10 - assuming 1 unit = $1 for simplicity or specific amounts)
                // For now, we accept any of the 3 tiers. 
                // Let's say 1.0, 5.0, 10.0 are the amounts.
                let valid_amounts = [Amount::from_tokens(1), Amount::from_tokens(5), Amount::from_tokens(10)];
                assert!(valid_amounts.contains(&amount), "Invalid stake amount. Must be 1, 5, or 10.");

                // In a real scenario, we would transfer funds here.
                // self.runtime.transfer(Account::owner(signer), Account::chain(self.runtime.chain_id()), amount);
                // For this MVP, we assume the user has sent funds or we just track the "stake" virtually 
                // if we can't easily pull funds without a credit/debit model.
                // Linera's model usually involves the user sending a transfer in the same block.
                // We'll just track it for now to avoid complex cross-application calls if not needed.
                
                let timestamp = self.runtime.system_time();
                let expiry = timestamp.saturating_add(self.state.epoch_duration.get().clone());
                
                let stake_info = StakeInfo {
                    amount,
                    timestamp,
                    expiry,
                };
                
                self.state.stakers.insert(&signer, stake_info).expect("Failed to insert stake");
                let current_pool = *self.state.pool_balance.get();
                self.state.pool_balance.set(current_pool.saturating_add(amount));
            }
            Operation::SubmitScore { score } => {
                let signer = self.runtime.authenticated_signer().expect("Signer required");
                // Check if staker exists and is active
                let stake = self.state.stakers.get(&signer).await.expect("Failed to get stake");
                assert!(stake.is_some(), "No active stake found");
                
                // Update leaderboard
                let mut leaderboard = self.state.leaderboard.get().clone();
                leaderboard.push(LeaderboardEntry { user: signer, score });
                leaderboard.sort_by(|a, b| b.score.cmp(&a.score)); // Descending
                leaderboard.truncate(10); // Keep top 10
                self.state.leaderboard.set(leaderboard);
            }
            Operation::Distribute => {
                // Check epoch end
                let now = self.runtime.system_time();
                let start = *self.state.epoch_start.get();
                let duration = *self.state.epoch_duration.get();
                let end = start.saturating_add(duration);
                
                if now >= end {
                    let balance = *self.state.pool_balance.get();
                    let leaderboard = self.state.leaderboard.get();
                    
                    if !leaderboard.is_empty() && balance > Amount::ZERO {
                        // Convert to u128 for calculation
                        let balance_u128 = u128::from(balance);
                        
                        // 50%, 30%, 20%
                        let share1 = Amount::from_attos(balance_u128.saturating_mul(50) / 100); // 50%
                        let share2 = Amount::from_attos(balance_u128.saturating_mul(30) / 100); // 30%
                        let share3 = Amount::from_attos(balance_u128.saturating_mul(20) / 100); // 20%
                        
                        // Distribute (Mock transfer logic)
                        // In reality: self.runtime.transfer(..., leaderboard[0].user, share1);
                        
                        // Reset for next epoch
                        self.state.pool_balance.set(Amount::ZERO);
                        self.state.epoch_start.set(now);
                        self.state.leaderboard.set(vec![]);
                        self.state.stakers.clear(); 
                    }
                }
            }
            Operation::AddBalance { amount } => {
                let signer = self.runtime.authenticated_signer().expect("Signer required");
                let current_balance = self.state.balances.get(&signer).await.expect("Failed to get balance").unwrap_or(Amount::ZERO);
                self.state.balances.insert(&signer, current_balance.saturating_add(amount)).expect("Failed to update balance");
            }
        }
    }

    async fn execute_message(&mut self, _message: Self::Message) {}

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
