import argparse

def calculate_gemini_cost_thb(input_tokens, output_tokens, model="gemini-3-pro"):
    # Exchange Rate (Approximate as of Jan 2026)
    usd_to_thb = 31.09
    
    # Prices per 1 Million Tokens (USD)
    pricing = {
        "gemini-3-pro": {"input": 2.00, "output": 12.00},
        "gemini-2.5-pro": {"input": 1.25, "output": 10.00},
        "gemini-flash": {"input": 0.15, "output": 0.60}
    }
    
    if model not in pricing:
        print(f"Error: Model '{model}' not found. Available models: {', '.join(pricing.keys())}")
        return None

    # Calculate USD
    cost_input_usd = (input_tokens / 1_000_000) * pricing[model]["input"]
    cost_output_usd = (output_tokens / 1_000_000) * pricing[model]["output"]
    total_usd = cost_input_usd + cost_output_usd
    
    # Convert to THB
    total_thb = total_usd * usd_to_thb
    
    return {
        "model": model,
        "total_thb": round(total_thb, 4),
        "input_cost_thb": round(cost_input_usd * usd_to_thb, 4),
        "output_cost_thb": round(cost_output_usd * usd_to_thb, 4),
        "breakdown": f"Input: {input_tokens:,} toks | Output: {output_tokens:,} toks"
    }

def main():
    parser = argparse.ArgumentParser(description="Calculate Gemini API Token Cost in THB")
    parser.add_argument("--input", type=int, required=True, help="Number of input tokens")
    parser.add_argument("--output", type=int, required=True, help="Number of output tokens")
    parser.add_argument("--model", type=str, default="gemini-3-pro", choices=["gemini-3-pro", "gemini-2.5-pro", "gemini-flash"], help="Gemini model to use")

    args = parser.parse_args()

    result = calculate_gemini_cost_thb(args.input, args.output, args.model)
    
    if result:
        print(f"--- Cost Calculation ({result['model']}) ---")
        print(f"Input Cost:  {result['input_cost_thb']} THB")
        print(f"Output Cost: {result['output_cost_thb']} THB")
        print(f"Total Cost:  {result['total_thb']} THB")
        print(f"Details:     {result['breakdown']}")

if __name__ == "__main__":
    main()
