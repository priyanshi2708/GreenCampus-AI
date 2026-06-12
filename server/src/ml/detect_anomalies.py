import sys
import json
import numpy as np

try:
    from sklearn.ensemble import IsolationForest
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

def detect_building_anomalies(building_name, values, metric_name, category):
    n = len(values)
    if n < 3:
        return None

    values_arr = np.array(values, dtype=float)
    latest_val = values_arr[-1]
    history = values_arr[:-1]
    
    mean = np.mean(history)
    std = np.std(history) if np.std(history) > 0 else mean * 0.05
    
    is_anomaly = False
    severity = "Warning"
    z_score = (latest_val - mean) / std if std > 0 else 0
    
    if latest_val <= mean:
        return None # Only flag upward surges as wastage anomalies

    if HAS_SKLEARN:
        try:
            X = values_arr.reshape(-1, 1)
            clf = IsolationForest(contamination=0.15, random_state=42)
            preds = clf.fit_predict(X)
            if preds[-1] == -1 and z_score > 1.5:
                is_anomaly = True
                if z_score > 2.3:
                    severity = "Critical"
        except:
            if z_score > 1.8:
                is_anomaly = True
                if z_score > 2.5:
                    severity = "Critical"
    else:
        if z_score > 1.8:
            is_anomaly = True
            if z_score > 2.5:
                severity = "Critical"

    if is_anomaly:
        pct_increase = ((latest_val - mean) / mean) * 100 if mean > 0 else 0
        unit = "kWh" if category == "Energy" else "L" if category == "Water" else "kg" if category == "Waste" else "kg CO2e"
        
        title = f"{category} Spike Detected"
        if category == "Energy":
            title = "Electricity Usage Spike"
        elif category == "Water":
            title = "Abnormal Water Consumption (Leak)"
        elif category == "Waste":
            title = "Waste Generation Surge"
        elif category == "Carbon":
            title = "Carbon Footprint Increase"

        desc = f"Latest {metric_name} usage of {latest_val:,.0f} {unit} is {pct_increase:.1f}% higher than the building average of {mean:,.0f} {unit}."
        
        est_excess = latest_val - mean
        cost_per_unit = 0.12 if category == "Energy" else 0.003 if category == "Water" else 0.15 if category == "Waste" else 0
        est_cost = est_excess * cost_per_unit
        
        impact = f"Est. excess cost: ${est_cost:,.2f}" if est_cost > 0 else "High environmental footprint impact."
        
        potential_causes = {
            "Energy": ["HVAC systems malfunctioning", "Laboratory server room cooling issues", "Lighting timers failed in unoccupied areas"],
            "Water": ["Main water pipe fissure / leak", "Cooling tower valve block", "Irrigation system timer malfunction"],
            "Waste": ["End-of-semester cleanouts", "Facilities construction residue dump", "Inadequate campus recycling segregation"],
            "Carbon": ["High electricity usage spike", "Increased heating / cooling boiler operations"]
        }
        
        cause_idx = int(latest_val) % len(potential_causes.get(category, ["Unknown"]))
        potential_cause = potential_causes.get(category, ["Unknown resource anomaly"])[cause_idx]
        
        recommended_actions = {
            "Energy": "Dispatch energy management team to audit building HVAC chillers and smart meter intervals.",
            "Water": "Inspect main pipe intersections and restrooms for toilet valve leakage.",
            "Waste": "Enforce building waste segregation checks and audit recycling dump bins.",
            "Carbon": "Optimize energy efficiency parameters and source renewable offsets."
        }
        recommended_action = recommended_actions.get(category, "Audit resource usage.")

        return {
            "title": f"{title} in {building_name}",
            "category": category,
            "building": building_name,
            "severity": severity,
            "description": desc,
            "impact": impact,
            "rootCause": {
                "whatHappened": f"A sudden {pct_increase:.1f}% surge in {metric_name} consumption was detected at {building_name}.",
                "whyFlagged": f"The latest reading of {latest_val:,.0f} {unit} exceeded the statistical threshold (Z-Score: {z_score:.2f}) based on historical patterns.",
                "potentialCause": potential_cause,
                "estimatedImpact": f"An excess of {est_excess:,.0f} {unit} consumed. {impact}",
                "recommendedAction": recommended_action
            }
        }
    return None

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        # input_data is a list of resource entries
        
        # Group by building
        by_building = {}
        for r in input_data:
            b = r.get('building', 'Unknown Building')
            if b not in by_building:
                by_building[b] = {
                    'electricity': [],
                    'water': [],
                    'waste': [],
                    'carbon': []
                }
            by_building[b]['electricity'].append(r.get('electricity', 0))
            by_building[b]['water'].append(r.get('water', 0))
            by_building[b]['waste'].append(r.get('waste', 0))
            by_building[b]['carbon'].append(r.get('carbon', 0))
            
        alerts = []
        for b, metrics in by_building.items():
            # Check Energy (electricity)
            energy_alert = detect_building_anomalies(b, metrics['electricity'], 'electricity', 'Energy')
            if energy_alert:
                alerts.append(energy_alert)
                
            # Check Water
            water_alert = detect_building_anomalies(b, metrics['water'], 'water', 'Water')
            if water_alert:
                alerts.append(water_alert)
                
            # Check Waste
            waste_alert = detect_building_anomalies(b, metrics['waste'], 'waste', 'Waste')
            if waste_alert:
                alerts.append(waste_alert)
                
            # Check Carbon
            carbon_alert = detect_building_anomalies(b, metrics['carbon'], 'carbon', 'Carbon')
            if carbon_alert:
                alerts.append(carbon_alert)
                
        print(json.dumps({'success': True, 'alerts': alerts}))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()
