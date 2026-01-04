# ts-gantt-engine

A highly customizable, lightweight Gantt chart engine written entirely in **TypeScript** and rendered using **HTML Canvas**.

Built for developers who need powerful Gantt chart functionality without the bloat. Features a task grid, interactive timeline, relation lines, multiple timeline comparisons, and extensive customization options—all in a lightweight package with minimal dependencies.

---

## 🚀 Live Demo

🔗 **Demo URL**  
https://tekula-hemanth-reddy.github.io/ts-gantt-engine-demo/

---

## ✨ Features

### 🎨 Fully Customizable
- **TypeScript-first design** for type safety and better developer experience
- **Canvas-powered rendering** for maximum performance and flexibility
- Extensive styling options: colors, fonts, dimensions, and more

### 📊 Dual-Component Architecture
- **Task Grid** — Vertical scrolling with hierarchical task display
- **Gantt Timeline** — Bi-directional scrolling (horizontal & vertical) with date-based visualization

### 🌲 Tree Structure Support
- Parent-child task hierarchy
- Smooth expand/collapse animations
- Visual indicators for nested relationships

### 📈 Multiple Timeline Support
- **Main timeline** for primary task duration
- **Comparison timelines** for planned vs actual, baseline, forecast, etc.
- Support for multiple duration types: original, planned, updated, actual, critical, baseline, forecast, or custom types

### 🔗 Task Relations
Draw and visualize four types of task dependencies with customizable colors:
- **FS** (Finish-to-Start)
- **SF** (Start-to-Finish)
- **SS** (Start-to-Start)
- **FF** (Finish-to-Finish)

### 🎯 Rich Interactions
- Tooltip support for detailed task information
- Click event emitters for taskbar interactions
- Responsive mouse tracking and selection

### ⚡ Lightweight & Fast
- Only **one dependency**: `moment-timezone`
- Minimal bundle size
- Optimized canvas rendering

---

## 📦 Installation

### npm
```bash
npm install ts-gantt-engine
```

### pnpm
```bash
pnpm add ts-gantt-engine
```

### yarn
```bash
yarn add ts-gantt-engine
```

<!-- ### CDN
```html
<script src="https://tekula-hemanth-reddy.github.io/ts-gantt-engine/dist/index.js"></script>
``` -->

---

## 🚀 Quick Start

```css
/* This will set canvas to take full width and height*/
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

```typescript
import { GanttEngine } from "ts-gantt-engine";

// Get your canvas element
const canvas = document.getElementById("gantt") as HTMLCanvasElement;

// Initialize the engine
const engine = new GanttEngine(
  canvas,
  "day", // time format: "day" | "week" | "month" | "quarter" | "year"
  (data) => {
    console.log("Task clicked:", data);
  }
);

// Define your headers
const headers = [
  { hId: "1", hName: "Task Name" },
  { hId: "2", hName: "Status" },
];

// Define your tasks
const tasks = [
  {
    pId: "1",
    pName: "Project Planning",
    pMainTimeline: {
      gId: "main",
      gName: "Main Timeline",
      gClass: "#9B59B6",
      gStart: new Date("2024-01-01"),
      gEnd: new Date("2024-01-04"),
      gPercentage: 75,
    },
    pTimelines: [
      {
        gId: "planned",
        gName: "Planned",
        gClass: "#E8DAEF",
        gStart: new Date("2024-01-01"),
        gEnd: new Date("2024-01-05"),
        gPercentage: 0,
      },
    ],
    pRelation: [],
    pData: { "1": "Project Planning", "2": "In Progress" },
  },
  {
    pId: "2",
    pName: "Design Phase",
    pMainTimeline: {
      gId: "main",
      gName: "Main Timeline",
      gClass: "#3498DB",
      gStart: new Date("2024-01-03"),
      gEnd: new Date("2024-01-06"),
      gPercentage: 50,
    },
    pTimelines: [],
    pParent: "1", // Child of task 1
    pRelation: [{ pTarget: "1", pType: "FS" }],
    pData: { "1": "Design Phase", "2": "Not Started" },
  },
];

// Render with custom options
engine.render(headers, tasks, {
  columnWidth: 100,
  headerHeight: 50,
  headerBg: '#F4F5F8',
  canvasBg: '#fff',
  fontColor: '#1F2329',
  lineColor: '#D2D8E3',
  font: '14px Arial',
  boxHeight: 50,
  barHeight: 20,
  barHorizontalResidue: 5,
  barVerticalResidue: 5,
  curveRadius: 3,
});

// Optional: Customize relation colors
const relationColors = {
  FS: "#2ECC71",
  SF: "#E74C3C",
  SS: "#3498DB",
  FF: "#F39C12",
};
engine.render(headers, tasks, options, relationColors);

// Destroy the canvas while destroying component or screen to avoid memory leaks
engine.destroy();
```

---

## 📖 API Reference

### `GanttEngine`

#### Constructor
```typescript
new GanttEngine(
  canvas: HTMLCanvasElement,
  format: "day" | "week" | "month" | "quarter" | "year",
  onTaskClick?: (data: GanttTask) => void
)
```

#### Methods

##### `render(headers, tasks, options, relationColors?)`
Renders the Gantt chart with the provided data.

```typescript
engine.render(
  headers: GanttHeader[],
  tasks: GanttTask[],
  options: GanttOptions,
  relationColors?: RelationColors
): void
```

##### `setFormat(format)`
Changes the time scale format.

```typescript
engine.setFormat(format: "day" | "week" | "month" | "quarter" | "year"): void
```

##### `clearScreen()`
Clears the canvas.

```typescript
engine.clearScreen(): void
```

##### `destroy()`
Stops drawing chart and destroy the canvas.

```typescript
engine.destroy(): void
```

##### `getCanvas()`
Returns the canvas element.

```typescript
engine.getCanvas(): HTMLCanvasElement
```

##### `getBounds()`
Returns the canvas dimensions.

```typescript
engine.getBounds(): number[]
```

---

## 📝 Type Definitions

### `GanttTask`
```typescript
interface GanttTask {
  pId: string;                    // Unique task ID
  pName: string;                  // Task name
  pMainTimeline: GanttDuration;   // Primary timeline (required)
  pTimelines: GanttDuration[];    // Additional comparison timelines (optional)
  pParent?: string;               // Parent task ID (for hierarchy)
  pRelation: {
    pTarget: string;              // Target task ID
    pType: "FF" | "SF" | "FS" | "SS";  // Relation type
  }[];
  pData: { [key: string]: string };    // Custom data (keyed by header ID)
}
```

### `GanttDuration`
```typescript
interface GanttDuration {
  gId: GanttDurationType;         // e.g., "main", "planned", "actual", etc.
  gName: string;                  // Label for the timeline
  gClass: string;                 // Color (hex or CSS color)
  gStart?: Date;                  // Start date (required for main)
  gEnd?: Date;                    // End date (required for main)
  gPercentage: number;            // Completion percentage (0-100)
}

type GanttDurationType = 
  | "main" 
  | "original" 
  | "planned" 
  | "updated" 
  | "actual" 
  | "critical" 
  | "baseline" 
  | "forecast" 
  | string;  // Custom types allowed
```

### `GanttHeader`
```typescript
interface GanttHeader {
  hId: string;      // Unique header ID
  hName: string;    // Header display name
}
```

### `GanttOptions`
```typescript
interface GanttOptions {
  columnWidth?: number;           // Width of grid columns (default: 100)
  headerHeight?: number;          // Height of header row (default: 50)
  headerBg?: string;              // Header background color
  canvasBg?: string;              // Canvas background color
  fontColor?: string;             // Text color
  lineColor?: string;             // Grid line color
  font?: string;                  // Font style (e.g., "14px Arial")
  boxHeight?: number;             // Height of task rows
  barHeight?: number;             // Height of taskbars
  barHorizontalResidue?: number;  // Horizontal padding for bars
  barVerticalResidue?: number;    // Vertical padding for bars
  curveRadius?: number;           // Border radius for taskbars
}
```

### `RelationColors`
```typescript
interface RelationColors {
  FS: string;  // Finish to Start color
  SF: string;  // Start to Finish color
  SS: string;  // Start to Start color
  FF: string;  // Finish to Finish color
}
```

---

## 🎨 Customization Examples

### Dark Theme
```typescript
engine.render(headers, tasks, {
  headerBg: "#1e1e1e",
  canvasBg: "#2d2d2d",
  fontColor: "#ffffff",
  lineColor: "#404040",
  font: "14px 'Segoe UI'",
});
```

### Compact View
```typescript
engine.render(headers, tasks, {
  columnWidth: 80,
  headerHeight: 35,
  boxHeight: 35,
  barHeight: 15,
  font: "12px Arial",
});
```

### Custom Relation Colors
```typescript
const relationColors = {
  FS: "#27AE60",  // Green for Finish-to-Start
  SF: "#E67E22",  // Orange for Start-to-Finish
  SS: "#2980B9",  // Blue for Start-to-Start
  FF: "#8E44AD",  // Purple for Finish-to-Finish
};

engine.render(headers, tasks, options, relationColors);
```

### Planned vs Actual Comparison
```typescript
const tasks = [
  {
    pId: "1",
    pName: "Development",
    pMainTimeline: {
      gId: "actual",
      gName: "Actual Progress",
      gClass: "#2ECC71",
      gStart: new Date("2024-01-01"),
      gEnd: new Date("2024-01-10"),
      gPercentage: 60,
    },
    pTimelines: [
      {
        gId: "planned",
        gName: "Planned Schedule",
        gClass: "#BDC3C7",
        gStart: new Date("2024-01-01"),
        gEnd: new Date("2024-01-08"),
        gPercentage: 0,
      },
    ],
    pRelation: [],
    pData: { "1": "Development", "2": "In Progress" },
  },
];
```

---

## 🗺️ Roadmap

### 🔜 Coming Soon
- **Bi-directional scrolling for Task Grid** — Horizontal scrolling support
- **Drag to resize tasks** — Interactive taskbar duration adjustment
- **Hover highlighting** — Highlight tasks and relations on mouse hover
- **Zoom controls** — Dynamic time scale adjustment
- **Export functionality** — Save charts as images or PDF

---

## 💡 Use Cases
- Project management dashboards
- Resource planning tools
- Production scheduling systems
- Event timeline visualization
- Workflow management applications
- Planned vs Actual tracking
- Baseline comparison and variance analysis

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📄 License

[MIT]

---

## 🔗 Links

- **NPM Package**: [ts-gantt-engine](https://www.npmjs.com/package/ts-gantt-engine)
<!-- - **CDN**: https://tekula-hemanth-reddy.github.io/ts-gantt-engine/dist/index.js -->
- **GitHub**: [ts-gantt-engine](https://github.com/Tekula-Hemanth-Reddy/ts-gantt-engine/)

---

## 📧 Support

For questions, issues, or feature requests, please open an issue on GitHub or reach out directly:
- **Email**: tekulahemanth@gmail.com
- **LinkedIn**: [Hemanth Reddy Tekula](https://www.linkedin.com/in/hemanth-reddy-tekula/)

---

**"Learn to fly, go up high, till you reach the sky."**