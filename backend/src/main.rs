use axum::{Router, extract::Path, response::Json, routing::get};

use serde_json::Value;

use dotenvy::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let app = Router::new()
        .route("/", get(check_health))
        .route("/price/{mint}", get(get_price));

    let listerner = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("server running at port http://127.0.0.1:3000");

    axum::serve(listerner, app).await.unwrap();
}
async fn check_health() -> &'static str {
    "Backend Running "
}
async fn get_price(Path(mint): Path<String>) -> Json<Value> {
    let api_key = env::var("JUP_API_KEY").expect("JUP_API_KEY not found/error");

    let url = format!("https://api.jup.ag/price/v3?ids={}", mint);

    let client = reqwest::Client::new();

    let res = client
        .get(url)
        .header("x-api-key", api_key)
        .send()
        .await
        .unwrap()
        .json::<Value>()
        .await
        .unwrap();
    Json(res)
}
