use axum::{Router, extract::Path, response::Json, routing::get};

use axum::http::StatusCode;
use reqwest::Client;
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
async fn get_jup_price(mint: &str) -> Result<Value, (StatusCode, String)> {
    let api_key = env::var("JUP_API_KEY").expect("JUP_API_KEY not found/error");

    let jup_url = format!("https://api.jup.ag/price/v3?ids={}", mint);

    let client = reqwest::Client::new();

    let res = client
        .get(jup_url)
        .header("x-api-key", api_key)
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?
        .json::<Value>()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?;
    let usd_res = res[&mint]["usdPrice"].clone();

    Ok(usd_res)
}

async fn get_orca_price(mint: &str) -> Result<Value, (StatusCode, String)> {
    let orca_url = format!("https://api.orca.so/v2/solana/tokens/{}", mint);

    let client = Client::new();

    let res = client
        .get(orca_url)
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?
        .json::<Value>()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?;
    let usd_res = res["data"]["priceUsdc"].clone();

    Ok(usd_res)
}
async fn get_radium_price(mint: &str) -> Result<Value, (StatusCode, String)> {
    let radium_url = format!("https://api-v3.raydium.io/mint/price?mints={}", mint);

    let client = reqwest::Client::new();

    let res = client
        .get(radium_url)
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?
        .json::<Value>()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?;
    let usd_res = res["data"][mint].clone();
    Ok(usd_res)
}

async fn get_price(Path(mint): Path<String>) -> Result<Json<Value>, (StatusCode, String)> {
    let jup = get_jup_price(&mint).await.ok();
    let orca = get_orca_price(&mint).await.ok();
    let radium = get_radium_price(&mint).await.ok();

    let result = serde_json::json!({
        "mint" : mint ,
        "prices" : {
        "orca" : orca ,
        "jup" : jup,
        "radium" : radium,
    }
    });
    Ok(Json(result))
}
