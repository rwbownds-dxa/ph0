import json
import os

def find_max_weights():
    # Dictionary to store maximum weights for each name
    max_weights = {}
    
    # Get all .json files in current directory
    json_files = [f for f in os.listdir('.') if f.endswith('.json')]
    
    if not json_files:
        print("No JSON files found in the current directory.")
        return None
    
    # Process each JSON file
    for json_file in json_files:
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
                
                # Assuming each file contains a list of dictionaries
                for item in data:
                    name = item.get('name')
                    weight = item.get('weight')
                    
                    if name and weight is not None:
                        # Update max weight if this weight is higher
                        if name in max_weights:
                            max_weights[name] = max(max_weights[name], weight)
                        else:
                            max_weights[name] = weight
                            
        except json.JSONDecodeError:
            print(f"Error reading {json_file}: Invalid JSON format")
        except Exception as e:
            print(f"Error processing {json_file}: {str(e)}")
    
    if not max_weights:
        print("No valid data found in JSON files.")
        return None
        
    return max_weights

def export_max_weights(max_weights):
    if not max_weights:
        return
    
    # Get filename from user
    filename = input("Enter the output filename (without .json extension): ")
    
    # Ensure .json extension
    if not filename.endswith('.json'):
        filename += '.json'
    
    # Convert dictionary to list of dictionaries for output
    output_data = [{"name": name, "weight": weight} 
                  for name, weight in max_weights.items()]
    
    # Write to file
    try:
        with open(filename, 'w') as f:
            json.dump(output_data, f, indent=4)
        print(f"Successfully exported maximum weights to {filename}")
    except Exception as e:
        print(f"Error writing to {filename}: {str(e)}")

def main():
    print("Processing JSON files to find maximum weights...")
    max_weights = find_max_weights()
    
    if max_weights:
        print(f"Found weights for {len(max_weights)} unique names")
        export_max_weights(max_weights)

if __name__ == "__main__":
    main()