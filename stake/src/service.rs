#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Schema};
use linera_sdk::{
    graphql::GraphQLMutationRoot, linera_base_types::{AccountOwner, Amount, WithServiceAbi}, views::View, Service,
    ServiceRuntime,
};
use stake::{LeaderboardEntry, Operation, StakeInfo};
use self::state::StakeState;

pub struct StakeService {
    state: Arc<StakeState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(StakeService);

impl WithServiceAbi for StakeService {
    type Abi = stake::StakeAbi;
}

impl Service for StakeService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = StakeState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        StakeService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, query: Self::Query) -> Self::QueryResponse {
        Schema::build(
            QueryRoot {
                state: self.state.clone(),
            },
            Operation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish()
        .execute(query)
        .await
    }
}

struct QueryRoot {
    state: Arc<StakeState>,
}

#[Object]
impl QueryRoot {
    async fn pool_balance(&self) -> Amount {
        *self.state.pool_balance.get()
    }

    async fn leaderboard(&self) -> Vec<LeaderboardEntry> {
        self.state.leaderboard.get().clone()
    }

    async fn get_stake(&self, owner: AccountOwner) -> Option<StakeInfo> {
        self.state.stakers.get(&owner).await.expect("Failed to get stake")
    }
}
