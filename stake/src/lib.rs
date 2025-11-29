use async_graphql::{Request, Response, SimpleObject};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{AccountOwner, Amount, ContractAbi, ServiceAbi, TimeDelta, Timestamp},
};
use serde::{Deserialize, Serialize};

pub struct StakeAbi;

impl ContractAbi for StakeAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for StakeAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    Stake { amount: Amount },
    SubmitScore { score: u64 },
    Distribute,
}

#[derive(Debug, Deserialize, Serialize, Clone, SimpleObject)]
pub struct StakeInfo {
    pub amount: Amount,
    pub timestamp: Timestamp,
    pub expiry: Timestamp,
}

#[derive(Debug, Deserialize, Serialize, Clone, SimpleObject)]
pub struct LeaderboardEntry {
    pub user: AccountOwner,
    pub score: u64,
}
