use crate::models::_entities::configs;
use crate::tasks::{assign_submissions::AssignSubmissions, gen_leaderboard::GenLeaderboard};
use chrono::{Local, Utc};
use loco_rs::prelude::*;

pub struct AssignAndGen;
#[async_trait]
impl Task for AssignAndGen {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "assign_and_gen".to_string(),
            detail: "Ran by the scheduler (runs every 1 min), Automatically runs assign_submissions and gen_leaderboard based on the current state. And also only runs them once.".to_string(),
        }
    }
    async fn run(&self, ctx: &AppContext, _vars: &task::Vars) -> Result<()> {
        // Fetch config
        let config = configs::Entity::find().one(&ctx.db).await?;
        let now = Local::now();
        if let Some(config) = config {
            // Only run assign_submissions if submission period has ended and we haven't assigned yet
            if let Some(sub_end) = config.submission_end {
                if now > sub_end {
                    if config.assigned {
                        println!("[assign_and_gen] submissions already assigned");
                        return Ok(());
                    }
                    // Use a marker: if voting_start is Some and voting_end is None, we are in voting period and can assign
                    // Or, if vote assignments table is empty, we can assign
                    // For simplicity, just always try to assign once after submission ends
                    println!("[assign_and_gen] Running assign_submissions...");
                    let assign_task = AssignSubmissions;
                    let _ = assign_task.run(ctx, _vars).await;
                    let mut config = config.clone().into_active_model();
                    config.assigned = Set(true);
                    config.save(&ctx.db).await?;
                }
            }
            // Only run gen_leaderboard if voting period has ended and we haven't generated yet
            if let Some(vote_end) = config.voting_end {
                if now > vote_end {
                    println!("[assign_and_gen] Running gen_leaderboard...");
                    if config.created_scores {
                        println!("[assign_and_gen] leaderboard already generated");
                        return Ok(());
                    }
                    // For simplicity, just always try to generate leaderboard once after voting ends

                    let gen_task = GenLeaderboard;
                    let _ = gen_task.run(ctx, _vars).await;
                    let mut config = config.into_active_model();
                    config.created_scores = Set(true);
                    config.save(&ctx.db).await?;
                }
            }
        } else {
            println!("[assign_and_gen] No config found, skipping.");
        }
        Ok(())
    }
}
