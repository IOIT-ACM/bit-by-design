use loco_rs::prelude::*;

use crate::models::_entities::vote_assignments;

pub struct ClearAssignments;
#[async_trait]
impl Task for ClearAssignments {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "clear_assignments".to_string(),
            detail: "Task generator".to_string(),
        }
    }
    async fn run(&self, ctx: &AppContext, _vars: &task::Vars) -> Result<()> {
        vote_assignments::Entity::delete_many()
            .exec(&ctx.db)
            .await?;
        println!("Assignments Cleared");
        Ok(())
    }
}
