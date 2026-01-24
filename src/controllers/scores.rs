#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::scores::{ActiveModel, Entity, Model},
    configs,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Params {
    pub submission_id: i32,
    pub problem_fit_score: i32,
    pub visual_clarity_score: i32,
    pub style_interpretation_score: i32,
    pub originality_score: i32,
    pub overall_quality_score: i32,
    pub final_score: i32,
}

impl Params {
    fn update(&self, item: &mut ActiveModel) {
        item.submission_id = Set(self.submission_id);
        item.problem_fit_score = Set(self.problem_fit_score);
        item.visual_clarity_score = Set(self.visual_clarity_score);
        item.style_interpretation_score = Set(self.style_interpretation_score);
        item.originality_score = Set(self.originality_score);
        item.overall_quality_score = Set(self.overall_quality_score);
        item.final_score = Set(self.final_score);
    }
}

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let config = configs::Entity::find().one(&ctx.db).await?;
    if let Some(config) = config {
        if config.show_leaderboard {
            return format::json(Entity::find().all(&ctx.db).await?);
        } else {
            return not_found();
        }
    }
    not_found()
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/scores/").add("/", get(list))
}
