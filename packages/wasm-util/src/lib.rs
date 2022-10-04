mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
  alert("Hello, wasm-util!");
}

#[wasm_bindgen]
pub fn sum(num1: u32, num2: u32) -> u32 {
  return num1 + num2;
}

#[wasm_bindgen]
pub fn loop_test(max: u32) -> u32 {
  let mut i = 0;
  let mut result = 0;
  while i < max {
    result += sum(1, 1 * 1);
    i += 1;
  }
  return result;
}
