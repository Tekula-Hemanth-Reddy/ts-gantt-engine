# ts-gantt-engine
# ts-gantt-engine

A highly customizable, lightweight Gantt chart engine written entirely in **TypeScript** and rendered using **HTML Canvas**.  
It includes a task grid and a Gantt timeline with powerful interaction features, relation lines, and flexible configuration options.  
Designed to be simple to integrate while giving developers full control over the look and behavior.

---

## ✨ Features (Current)

### ✔ Fully customizable, TypeScript-first & Canvas-powered
Written completely in TypeScript, rendered using HTML Canvas for maximum performance and flexibility.

### ✔ Two major components
- **Task Grid** — Vertical-only scroll  
- **Gantt Chart** — Scrolls both vertically & horizontally

### ✔ Tree-like structure with expandable rows
Supports parent-child task hierarchy with smooth expand/collapse behavior.

### ✔ Precise user interaction tools
- Tooltip support  
- Taskbar click event emitter  
- Draw task relations:  
  **FS (Finish-to-Start), SF (Start-to-Finish), SS (Start-to-Start), FF (Finish-to-Finish)**

### ✔ Extensive optional configuration
Customize:
- Header color  
- Background color  
- Text color  
- Stroke color  
- Font styles  

### ✔ Lightweight codebase
Only **one dependency**: `moment-timezone` (for robust date handling).

---

## 🚧 Roadmap (Future Features)

### 🔜 Bi-directional scrolling for Task Grid
Enable horizontal scrolling in addition to vertical.

### 🔜 Drag to update task durations
Interactive resizing of task bars by dragging start or end points.

### 🔜 Support for planned vs. actual timelines
Allow each task to have **two date pairs** — planned and actual — and render both.

### 🔜 Hover highlighting
Highlight the active task bar and its relations on mouse hover.

---

## 📦 Installation (npm)

```bash
npm install ts-gantt-engine

