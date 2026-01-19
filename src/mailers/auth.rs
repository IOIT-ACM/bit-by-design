// auth mailer
#![allow(non_upper_case_globals)]

use loco_rs::{mailer::MailerOpts, prelude::*};
use serde_json::json;

use crate::models::users;

static otp: Dir<'_> = include_dir!("src/mailers/auth/otp");

#[allow(clippy::module_name_repetitions)]
pub struct AuthMailer {}
impl Mailer for AuthMailer {
    fn opts() -> MailerOpts {
        MailerOpts {
            from: "comp@siegproject.com".to_string(),
            ..Default::default()
        }
    }
}
impl AuthMailer {
    ///Sending OTP
    pub async fn send_otp(ctx: &AppContext, user: &users::Model) -> Result<()> {
        Self::mail_template(
            ctx,
            &otp,
            mailer::Args {
                to: user.email.to_string(),
                locals: json!({
                  "OTP": user.otp,
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }
}
