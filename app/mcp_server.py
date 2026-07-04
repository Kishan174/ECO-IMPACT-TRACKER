import sys
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("eco_impact_mcp")

@mcp.tool()
def get_green_alternatives(category: str) -> str:
    """Returns local green alternatives and lifestyle recommendations for a given consumption category.
    
    Args:
        category: The category of emissions (e.g., 'transport', 'diet', 'energy', 'waste').
    """
    alternatives = {
        "transport": "Consider public transit, carpooling, riding a bicycle, or switching to an electric vehicle. Domestic flights have the highest footprint; train travel is 80% cleaner.",
        "diet": "Shifting to a plant-based diet can reduce diet-related emissions by up to 70%. Avoid beef and lamb, which have the highest emissions footprint. Choose seasonal, locally grown produce.",
        "energy": "Switch to a renewable energy provider, upgrade to LED bulbs, install a smart thermostat, or consider residential solar panels. Heat pumps are 3-4x more efficient than gas boilers.",
        "waste": "Minimize food waste by meal planning, compost organic materials to reduce methane emissions, and reuse/recycle paper, plastics, and glass."
    }
    return alternatives.get(category.lower(), f"Ensure general energy efficiency and resource conservation in the {category} category.")

@mcp.tool()
def calculate_emissions_factor(activity: str) -> str:
    """Provides carbon emission factors in kg CO2 per unit of activity.
    
    Args:
        activity: The activity type (e.g., 'flight_domestic', 'car_gasoline', 'electricity_kwh', 'beef_kg').
    """
    factors = {
        "flight_domestic": "0.25 kg CO2 per passenger-mile",
        "flight_international": "0.18 kg CO2 per passenger-mile",
        "car_gasoline": "0.40 kg CO2 per mile",
        "car_ev": "0.08 kg CO2 per mile",
        "electricity_kwh": "0.38 kg CO2 per kWh",
        "beef_kg": "27.0 kg CO2 per kg of beef",
        "poultry_kg": "6.0 kg CO2 per kg of poultry",
        "vegetables_kg": "2.0 kg CO2 per kg of vegetables"
    }
    return factors.get(activity.lower(), "Emission factor not found. Please estimate using average values.")

@mcp.tool()
def get_offset_options(emissions_kg: float) -> str:
    """Recommends carbon offsetting strategies for a given volume of carbon emissions.
    
    Args:
        emissions_kg: The total carbon emissions to offset in kilograms.
    """
    trees_needed = max(1, int(emissions_kg / 22))  # Average tree absorbs 22kg CO2 per year
    return (
        f"To offset your {emissions_kg:.1f} kg CO2 footprint, you could:\n"
        f"1. Plant approximately {trees_needed} mature trees to absorb this carbon over a year.\n"
        f"2. Support Gold Standard or Verified Carbon Standard (VCS) wind or solar energy projects.\n"
        f"3. Support local methane recapture programs from landfills or agriculture."
    )

if __name__ == "__main__":
    mcp.run()
