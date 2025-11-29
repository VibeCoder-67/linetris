use linera_sdk::{
    linera_base_types::{AccountOwner, Amount, TimeDelta, Timestamp},
    views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext},
};
use stake::{LeaderboardEntry, StakeInfo};

#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct StakeState {
    pub stakers: MapView<AccountOwner, StakeInfo>,
    pub pool_balance: RegisterView<Amount>,
    pub epoch_start: RegisterView<Timestamp>,
    pub epoch_duration: RegisterView<TimeDelta>,
    pub leaderboard: RegisterView<Vec<LeaderboardEntry>>,
}
