use loco_rs::prelude::*;

use crate::models::{_entities::votes, scores, submissions};

#[derive(Default)]
struct CriterionScores<T> {
    problem_fit: T,
    clarity: T,
    style_interpretation: T,
    originality: T,
    overall_quality: T,
}

/// Calculate median of a slice. Returns None if empty.
fn median(values: &mut [i32]) -> Option<f32> {
    if values.is_empty() {
        return None;
    }
    values.sort();
    let n = values.len();
    if n % 2 == 1 {
        Some(values[n / 2] as f32)
    } else {
        Some((values[n / 2 - 1] + values[n / 2]) as f32 / 2.0)
    }
}

/// Convert a 1-5 score to 0-1000 scale (1→200, 5→1000)
fn scale_to_1000(score: f32) -> i32 {
    (score * 200.0) as i32
}

/// Scale final score with higher precision to avoid collisions (1→2000, 5→10000)
fn scale_final(score: f32) -> i32 {
    (score * 2000.0) as i32
}

// Weights for each criterion (must sum to 1.0)
const WEIGHT_PROBLEM_FIT: f32 = 0.25;
const WEIGHT_CLARITY: f32 = 0.20;
const WEIGHT_STYLE: f32 = 0.20;
const WEIGHT_ORIGINALITY: f32 = 0.15;
const WEIGHT_OVERALL: f32 = 0.20;

pub struct GenLeaderboard;
#[async_trait]
impl Task for GenLeaderboard {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "gen_leaderboard".to_string(),
            detail: "Task generator".to_string(),
        }
    }
    async fn run(&self, ctx: &AppContext, _vars: &task::Vars) -> Result<()> {
        //clear scores if they exist already
        scores::Entity::delete_many().exec(&ctx.db).await?;
        let all_submissions = submissions::Entity::find().all(&ctx.db).await?;
        for submission in all_submissions {
            let votes = votes::Entity::find()
                .filter(votes::Column::SubmissionId.eq(submission.id))
                .all(&ctx.db)
                .await?;

            // Skip submissions with no votes
            if votes.is_empty() {
                println!("Skipping submission {} - no votes received", submission.id);
                continue;
            }

            let mut aggregate_scores: CriterionScores<Vec<i32>> = Default::default();
            for vote in votes {
                aggregate_scores.problem_fit.push(vote.problem_fit_score);
                aggregate_scores.clarity.push(vote.clarity_score);
                aggregate_scores
                    .style_interpretation
                    .push(vote.style_interpretation_score);
                aggregate_scores.originality.push(vote.originality_score);
                aggregate_scores
                    .overall_quality
                    .push(vote.overall_quality_score);
            }

            // Calculate raw median scores (1-5 scale)
            let raw_scores = CriterionScores::<f32> {
                problem_fit: median(&mut aggregate_scores.problem_fit).unwrap_or(0.0),
                clarity: median(&mut aggregate_scores.clarity).unwrap_or(0.0),
                style_interpretation: median(&mut aggregate_scores.style_interpretation)
                    .unwrap_or(0.0),
                originality: median(&mut aggregate_scores.originality).unwrap_or(0.0),
                overall_quality: median(&mut aggregate_scores.overall_quality).unwrap_or(0.0),
            };

            // Calculate weighted average (still 1-5 scale)
            let weighted_average = raw_scores.problem_fit * WEIGHT_PROBLEM_FIT
                + raw_scores.clarity * WEIGHT_CLARITY
                + raw_scores.style_interpretation * WEIGHT_STYLE
                + raw_scores.originality * WEIGHT_ORIGINALITY
                + raw_scores.overall_quality * WEIGHT_OVERALL;

            // Store scores scaled to 0-1000 (so 5/5 = 1000, 1/5 = 200)
            // Final score uses higher precision (0-10000) to reduce ranking collisions
            let score = scores::ActiveModel {
                submission_id: Set(submission.id),
                problem_fit_score: Set(scale_to_1000(raw_scores.problem_fit)),
                visual_clarity_score: Set(scale_to_1000(raw_scores.clarity)),
                style_interpretation_score: Set(scale_to_1000(raw_scores.style_interpretation)),
                originality_score: Set(scale_to_1000(raw_scores.originality)),
                overall_quality_score: Set(scale_to_1000(raw_scores.overall_quality)),
                final_score: Set(scale_final(weighted_average)),
                ..Default::default()
            };
            score.insert(&ctx.db).await?;
        }
        println!("Generated Leaderboard successfully.");
        Ok(())
    }
}
