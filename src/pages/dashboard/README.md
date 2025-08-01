# Secret Dashboard System

This directory contains standalone dashboard pages that can be accessed directly via URL without being indexed in the main application.

## Current Dashboards

*No active dashboards - use the template to create new ones*

## How to Add New Dashboards

1. **Copy the template**:
   ```bash
   cp src/pages/dashboard/_template.tsx src/pages/dashboard/your-dashboard-name.tsx
   ```

2. **Update the component name and content**:
   - Change the export name from `DashboardTemplate` to your dashboard name
   - Replace sample data with your actual data
   - Customize the styling and content

3. **Add route** (in `src/app/routes.tsx`):
   ```tsx
   // Add lazy import at the top
   const YourDashboard = lazy(() => import('../pages/dashboard/your-dashboard-name'));
   
   // Add route in AppRoutes component
   <Route 
     path="/dashboard/your-dashboard-name" 
     element={
       <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>}>
         <YourDashboard />
       </Suspense>
     } 
   />
   ```

4. **Access your dashboard**:
   - `https://mydebugger.vercel.app/dashboard/your-dashboard-name`

## Features

- **Standalone**: No shared components, completely self-contained
- **No indexing**: Not listed in main navigation or tool registry
- **Self-styled**: Includes all necessary CSS inline
- **Charts**: Simple SVG-based charts (no external chart libraries)
- **Responsive**: Mobile-friendly design
- **Easy to remove**: Just delete the file and remove the route

## Notes

- These dashboards are meant to be temporary/secret pages
- They don't appear in search or navigation
- Perfect for hosting short-term project dashboards
- Can be easily deployed and removed as needed

## Chart Components Available

- `SimpleBarChart`: Basic bar chart with labels
- `SimplePieChart`: Basic pie chart with percentages
- All charts are SVG-based and work without external dependencies

## Styling

Each dashboard includes its own inline styles to ensure complete independence from the main application's styling system.
