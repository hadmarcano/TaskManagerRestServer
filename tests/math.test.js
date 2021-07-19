const {
  calculatingTip,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
} = require("../src/math");

test("Should calculate total with tip", () => {
  const value = calculatingTip(10, 0.3);

  expect(value).toBe(13);
});

test("Should convert 32 F to 0 C", () => {
  const value = fahrenheitToCelsius(32);

  expect(value).toBe(0);
});

test("Should convert 0 C to 32 F", () => {
  const value = celsiusToFahrenheit(0);

  expect(value).toBe(32);
});
