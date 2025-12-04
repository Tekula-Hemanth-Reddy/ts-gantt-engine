# ts-gantt-engine

A highly customizable, lightweight Gantt chart engine written entirely in **TypeScript** and rendered using **HTML Canvas**.

Built for developers who need powerful Gantt chart functionality without the bloat. Features a task grid, interactive timeline, relation lines, and extensive customization options—all in a lightweight package with minimal dependencies.

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

### 🔗 Task Relations
Draw and visualize four types of task dependencies:
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

### CDN
```html
<script src="https://tekula-hemanth-reddy.github.io/ts-gantt-engine/dist/index.js"></script>
```

---

## 🚀 Quick Start

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
    pDurations: {
      gClass: "#9B59B6",
      gStart: new Date("2024-01-01"),
      gEnd: new Date("2024-01-04"),
      gPercentage: 75,
    },
    pRelation: [],
    pData: { "1": "Project Planning", "2": "In Progress" },
  },
  {
    pId: "2",
    pName: "Design Phase",
    pDurations: {
      gClass: "#3498DB",
      gStart: new Date("2024-01-03"),
      gEnd: new Date("2024-01-06"),
      gPercentage: 50,
    },
    pParent: "1", // Child of task 1
    pRelation: [{ pTarget: "1", pType: "FS" }],
    pData: { "1": "Design Phase", "2": "Not Started" },
  },
];

// Render with custom options
engine.render(headers, tasks, {
  columnWidth: 100,
  rowHeight: 50,
  headerBg: "#fafafa",
  canvasBg: "#ffffff",
  fontColor: "#333333",
  lineColor: "#e0e0e0",
  font: "14px Arial",
});
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

##### `render(headers, tasks, options)`
Renders the Gantt chart with the provided data.

```typescript
engine.render(
  headers: GanttHeader[],
  tasks: GanttTask[],
  options: GanttOptions
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
  pDurations: {
    gClass: string;               // Color (hex or CSS color)
    gStart?: Date;                // Start date
    gEnd?: Date;                  // End date
    gPercentage?: number;         // Completion percentage (0-100)
  };
  pParent?: string;               // Parent task ID (for hierarchy)
  pRelation: {
    pTarget: string;              // Target task ID
    pType: "FF" | "SF" | "FS" | "SS";  // Relation type
  }[];
  pData: { [key: string]: string };    // Custom data (keyed by header ID)
}
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
  columnWidth?: number;    // Width of grid columns (default: 100)
  rowHeight?: number;      // Height of rows (default: 50)
  headerBg?: string;       // Header background color
  canvasBg?: string;       // Canvas background color
  fontColor?: string;      // Text color
  lineColor?: string;      // Grid line color
  font?: string;          // Font style (e.g., "14px Arial")
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
  rowHeight: 35,
  font: "12px Arial",
});
```

---

## 🗺️ Roadmap

### 🔜 Coming Soon
- **Bi-directional scrolling for Task Grid** — Horizontal scrolling support
- **Drag to resize tasks** — Interactive taskbar duration adjustment
- **Planned vs. Actual timelines** — Dual date ranges with visual comparison
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

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📄 License

[MIT]

---

## 🔗 Links

- **NPM Package**: [ts-gantt-engine](https://www.npmjs.com/package/ts-gantt-engine)
- **CDN**: https://tekula-hemanth-reddy.github.io/ts-gantt-engine/dist/index.js
- **GitHub**: [ts-gantt-engine](https://github.com/Tekula-Hemanth-Reddy/ts-gantt-engine/)

---

## 📧 Support

For questions, issues, or feature requests, please open an issue on GitHub or reach out directly:

- **Email**: tekulahemanth@gmail.com
- **LinkedIn**: [Hemanth Reddy Tekula](https://www.linkedin.com/in/hemanth-reddy-tekula/)

---

**"Learn to fly, go up high, till you reach the sky."**