use axum::http::{HeaderName, HeaderValue};
use bit_by_design::{models::users, views::auth::LoginResponse};
use loco_rs::{app::AppContext, TestServer};

const USER_EMAIL: &str = "test@loco.com";

pub struct LoggedInUser {
    pub user: users::Model,
    pub token: String,
}

pub async fn init_user_login(request: &TestServer, ctx: &AppContext) -> LoggedInUser {
    let send_otp_payload = serde_json::json!({
        "name": "loco",
        "email": USER_EMAIL,
    });

    //Creating a new user
    request
        .post("/api/auth/send-otp")
        .json(&send_otp_payload)
        .await;
    let user = users::Model::find_by_email(&ctx.db, USER_EMAIL)
        .await
        .unwrap();

    let login_payload = serde_json::json!({
        "email": user.email,
        "otp": user.otp,
    });

    let response = request.post("/api/auth/login").json(&login_payload).await;

    let login_response: LoginResponse = serde_json::from_str(&response.text()).unwrap();

    LoggedInUser {
        user: users::Model::find_by_email(&ctx.db, USER_EMAIL)
            .await
            .unwrap(),
        token: login_response.token,
    }
}

pub fn auth_header(token: &str) -> (HeaderName, HeaderValue) {
    let auth_header_value = HeaderValue::from_str(&format!("Bearer {}", &token)).unwrap();

    (HeaderName::from_static("authorization"), auth_header_value)
}
