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
fn median(values: &mut [i32]) -> f32 {
    values.sort();
    let n = values.len();
    if !n.is_multiple_of(2) {
        values[n / 2] as f32
    } else {
        ((values[n / 2 - 1] + values[n / 2]) / 2) as f32
    }
}
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
        let all_submissions = submissions::Entity::find().all(&ctx.db).await?;
        for submission in all_submissions {
            let votes = votes::Entity::find()
                .filter(votes::Column::SubmissionId.eq(submission.id))
                .all(&ctx.db)
                .await?;
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
            let final_scores = CriterionScores::<f32> {
                problem_fit: median(&mut aggregate_scores.problem_fit) * 0.25,
                clarity: median(&mut aggregate_scores.clarity) * 0.20,
                style_interpretation: median(&mut aggregate_scores.style_interpretation) * 0.20,
                originality: median(&mut aggregate_scores.originality) * 0.15,
                overall_quality: median(&mut aggregate_scores.overall_quality) * 0.20,
            };

            let weighted_score = final_scores.problem_fit
                + final_scores.clarity
                + final_scores.style_interpretation
                + final_scores.originality
                + final_scores.overall_quality;
            let normalized_score = ((weighted_score / 5.0) * 1000.0) as i32;
            let score = scores::ActiveModel {
                submission_id: Set(submission.id),
                problem_fit_score: Set(final_scores.problem_fit as i32),
                visual_clarity_score: Set(final_scores.clarity as i32),
                style_interpretation_score: Set(final_scores.style_interpretation as i32),
                originality_score: Set(final_scores.originality as i32),
                overall_quality_score: Set(final_scores.overall_quality as i32),
                final_score: Set(normalized_score),
                ..Default::default()
            };
            score.insert(&ctx.db).await?;
        }
        println!("Generated Leaderboard successfully.");
        Ok(())
    }
}
