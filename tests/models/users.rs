use bit_by_design::{
    app::App,
    models::users::{self, Model},
};
use insta::assert_debug_snapshot;
use loco_rs::testing::prelude::*;
use sea_orm::{ActiveModelTrait, ActiveValue};
use serial_test::serial;

macro_rules! configure_insta {
    ($($expr:expr),*) => {
        let mut settings = insta::Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("users");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn test_can_validate_model() {
    configure_insta!();

    let boot = boot_test::<App>()
        .await
        .expect("Failed to boot test application");

    let invalid_user = users::ActiveModel {
        name: ActiveValue::set("1".to_string()),
        email: ActiveValue::set("invalid-email".to_string()),
        ..Default::default()
    };

    let res = invalid_user.insert(&boot.app_context.db).await;

    assert_debug_snapshot!(res);
}

#[tokio::test]
#[serial]
async fn can_find_by_email() {
    configure_insta!();

    let boot = boot_test::<App>()
        .await
        .expect("Failed to boot test application");
    seed::<App>(&boot.app_context)
        .await
        .expect("Failed to seed database");

    let existing_user = Model::find_by_email(&boot.app_context.db, "user1@example.com").await;
    let non_existing_user_results =
        Model::find_by_email(&boot.app_context.db, "un@existing-email.com").await;

    assert_debug_snapshot!(existing_user);
    assert_debug_snapshot!(non_existing_user_results);
}

#[tokio::test]
#[serial]
async fn can_find_by_pid() {
    configure_insta!();

    let boot = boot_test::<App>()
        .await
        .expect("Failed to boot test application");
    seed::<App>(&boot.app_context)
        .await
        .expect("Failed to seed database");

    let existing_user =
        Model::find_by_pid(&boot.app_context.db, "11111111-1111-1111-1111-111111111111").await;
    let non_existing_user_results =
        Model::find_by_pid(&boot.app_context.db, "23232323-2323-2323-2323-232323232323").await;

    assert_debug_snapshot!(existing_user);
    assert_debug_snapshot!(non_existing_user_results);
}
