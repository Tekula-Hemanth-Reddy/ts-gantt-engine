# ts-gantt-engine

A highly customizable, lightweight Gantt chart engine written entirely in **TypeScript** and rendered using **HTML Canvas**.

Build interactive project timelines with a powerful task grid, zoomable Gantt timeline, hierarchical task relationships, and flexible configuration—all with minimal dependencies.

---

## ✨ Features

### 🎨 **Fully Customizable & TypeScript-First**
- Written completely in TypeScript with full type safety
- Rendered using HTML Canvas for maximum performance
- Extensive styling options for colors, fonts, and layout

### 📊 **Dual-Component Architecture**
- **Task Grid** — Displays task metadata with vertical scrolling
- **Gantt Timeline** — Interactive chart with bi-directional scrolling

### 🌳 **Hierarchical Task Management**
- Tree-like parent-child task structure
- Smooth expand/collapse animations
- Visual indentation for nested tasks

### 🔗 **Advanced Task Relationships**
Draw and visualize task dependencies:
- **FS** (Finish-to-Start)
- **SF** (Start-to-Finish)
- **SS** (Start-to-Start)
- **FF** (Finish-to-Finish)

### ⚡ **Rich Interactions**
- Built-in tooltip support
- Task bar click events
- Multiple zoom levels: day, week, month, quarter, year
- Configurable row heights and column widths

### 🪶 **Lightweight**
Only **one dependency**: `moment-timezone` for robust date handling

---

## 🚀 Installation

### npm
```bash
npm install ts-gantt-engine
```

### CDN
```html
<script src="https://tekula-hemanth-reddy.github.io/ts-gantt-engine/dist/index.js"></script>
```

---

## 📖 Quick Start

```typescript
import { GanttChartEngine } from "ts-gantt-engine";
import type { GanttHeader, GanttTask } from "ts-gantt-engine";

// Get your canvas element
const canvas = document.getElementById("gantt") as HTMLCanvasElement;

// Initialize the engine
const engine = new GanttChartEngine(
  canvas,
  "day", // zoom level: 'day' | 'week' | 'month' | 'quarter' | 'year'
  (taskData) => {
    console.log("Task clicked:", taskData);
  }
);

// Define column headers
const headers: GanttHeader[] = [
  { hId: "1", hName: "Task Name" },
  { hId: "2", hName: "Status" },
  { hId: "3", hName: "Owner" }
];

// Define tasks
const today = new Date();
const inThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
const inFiveDays = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

const tasks: GanttTask[] = [
  {
    pId: "1",
    pName: "Project Planning",
    pDurations: {
      gClass: "#9B59B6",
      gStart: today,
      gEnd: inThreeDays,
      gPercentage: 75
    },
    pRelation: [],
    pData: { "1": "Project Planning", "2": "In Progress", "3": "Alice" }
  },
  {
    pId: "2",
    pName: "Design Phase",
    pParent: "1", // Child of task "1"
    pDurations: {
      gClass: "#3498DB",
      gStart: inThreeDays,
      gEnd: inFiveDays,
      gPercentage: 50
    },
    pRelation: [{ pTarget: "1", pType: "FS" }], // Finish-to-Start dependency
    pData: { "1": "Design Phase", "2": "Not Started", "3": "Bob" }
  }
];

// Render the chart with custom options
engine.setDataAndDraw(
  headers,
  tasks,
  100,        // columnWidth
  50,         // rowHeight
  "#fafafa",  // headerBg
  "#ffffff",  // canvasBg
  "#452829",  // fontColor
  "#e0e0e0",  // lineColor
  "14px Arial" // font
);
```

---

## 📚 API Reference

### **GanttChartEngine**

#### Constructor
```typescript
new GanttChartEngine(
  canvas: HTMLCanvasElement,
  format: PFormat,
  onTaskClick?: (task: GanttTask) => void
)
```

#### Methods
```typescript
// Set data and render
setDataAndDraw(
  headers: GanttHeader[],
  data: GanttTask[],
  columnWidth?: number,
  rowHeight?: number,
  headerBg?: string,
  canvasBg?: string,
  fontColor?: string,
  lineColor?: string,
  font?: string
): void

// Change zoom level
setFormat(format: PFormat): void

// Clear the canvas
clearScreen(): void

// Get canvas dimensions
getBounds(): number[]
```

---

## 🎨 Type Definitions

### **GanttTask**
```typescript
interface GanttTask {
  pId: string;
  pName: string;
  pDurations: {
    gClass: string;         // Bar color (hex)
    gStart?: Date;
    gEnd?: Date;
    gPercentage?: number;   // Completion percentage (0-100)
  };
  pParent?: string;         // Parent task ID for hierarchy
  pRelation: {
    pTarget: string;        // Target task ID
    pType: "FF" | "SF" | "FS" | "SS";
  }[];
  pData: { [key: string]: string }; // Grid column data (key = hId)
}
```

### **GanttHeader**
```typescript
interface GanttHeader {
  hId: string;
  hName: string;
}
```

### **PFormat**
```typescript
type PFormat = "day" | "week" | "month" | "quarter" | "year";
```

---

## 🛣️ Roadmap

### 🔜 **Enhanced Grid Scrolling**
Bi-directional scrolling for the task grid

### 🔜 **Interactive Duration Editing**
Drag task bars to update start/end dates

### 🔜 **Planned vs Actual Timelines**
Support dual date pairs for baseline vs actual progress

### 🔜 **Hover Effects**
Highlight active tasks and their dependencies on mouseover

### 🔜 **Export Capabilities**
Export charts as PNG/SVG

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **npm**: [https://www.npmjs.com/package/ts-gantt-engine]

---

**"Learn to fly, go up high, till you reach the sky."**