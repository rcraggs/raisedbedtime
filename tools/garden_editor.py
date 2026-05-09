import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
from datetime import date

class TaskDialog(tk.Toplevel):
    def __init__(self, parent, task_data=None, on_save=None):
        super().__init__(parent)
        self.title("Edit Task" if task_data else "Add Task")
        self.task_data = task_data or {}
        self.on_save = on_save

        ttk.Label(self, text="Name:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.name_var = tk.StringVar(value=self.task_data.get('name', ''))
        ttk.Entry(self, textvariable=self.name_var).grid(row=0, column=1, sticky=tk.EW, padx=5, pady=5)

        ttk.Label(self, text="Month:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.month_var = tk.StringVar(value=self.task_data.get('month', 'January'))
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        ttk.Combobox(self, textvariable=self.month_var, values=months, state="readonly").grid(row=1, column=1, sticky=tk.EW, padx=5, pady=5)

        ttk.Label(self, text="Sections (comma separated):").grid(row=2, column=0, sticky=tk.W, padx=5, pady=5)
        sections = self.task_data.get('sections', [])
        self.sections_var = tk.StringVar(value=", ".join(map(str, sections)))
        ttk.Entry(self, textvariable=self.sections_var).grid(row=2, column=1, sticky=tk.EW, padx=5, pady=5)

        self.is_done_var = tk.BooleanVar(value=self.task_data.get('isDone', False))
        ttk.Checkbutton(self, text="Is Done", variable=self.is_done_var, command=self.on_is_done_toggle).grid(row=3, column=1, sticky=tk.W, padx=5, pady=5)

        ttk.Label(self, text="Done Date (YYYY-MM-DD):").grid(row=4, column=0, sticky=tk.W, padx=5, pady=5)
        self.done_date_var = tk.StringVar(value=self.task_data.get('doneDate', ''))
        self.done_date_entry = ttk.Entry(self, textvariable=self.done_date_var)
        self.done_date_entry.grid(row=4, column=1, sticky=tk.EW, padx=5, pady=5)

        ttk.Label(self, text="Notes:").grid(row=5, column=0, sticky=tk.NW, padx=5, pady=5)
        self.notes_text = tk.Text(self, width=30, height=4)
        self.notes_text.insert(tk.END, self.task_data.get('notes', ''))
        self.notes_text.grid(row=5, column=1, sticky=tk.EW, padx=5, pady=5)

        ttk.Button(self, text="Save", command=self.save).grid(row=6, column=1, sticky=tk.E, padx=5, pady=10)
        self.columnconfigure(1, weight=1)

    def on_is_done_toggle(self):
        if self.is_done_var.get() and not self.done_date_var.get():
            self.done_date_var.set(date.today().strftime('%Y-%m-%d'))

    def save(self):
        name = self.name_var.get().strip()
        if not name:
            messagebox.showerror("Error", "Name is required.")
            return
        new_data = {'name': name, 'month': self.month_var.get()}
        sections_str = self.sections_var.get().strip()
        if sections_str:
            try:
                new_data['sections'] = [int(x.strip()) for x in sections_str.split(',') if x.strip()]
            except ValueError:
                messagebox.showerror("Error", "Sections must be numbers.")
                return
        if self.is_done_var.get(): new_data['isDone'] = True
        if self.done_date_var.get(): new_data['doneDate'] = self.done_date_var.get()
        notes = self.notes_text.get(1.0, tk.END).strip()
        if notes: new_data['notes'] = notes
        if self.on_save: self.on_save(new_data)
        self.destroy()

class GardenEditor(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Garden Data Editor")
        self.geometry("900x600")
        self.data = {"plants": []}
        self.current_file = None
        
        self.create_menu()
        self.create_widgets()

    def create_menu(self):
        menubar = tk.Menu(self)
        filemenu = tk.Menu(menubar, tearoff=0)
        filemenu.add_command(label="Open", command=self.open_file)
        filemenu.add_command(label="Save", command=self.save_file)
        filemenu.add_command(label="Save As", command=self.save_file_as)
        filemenu.add_separator()
        filemenu.add_command(label="Exit", command=self.quit)
        menubar.add_cascade(label="File", menu=filemenu)
        self.config(menu=menubar)

    def create_widgets(self):
        self.paned_window = ttk.PanedWindow(self, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Left Pane: Plants
        self.left_frame = ttk.Frame(self.paned_window)
        self.paned_window.add(self.left_frame, weight=1)
        
        ttk.Label(self.left_frame, text="Plants", font=('', 12, 'bold')).pack(anchor=tk.W)
        self.plant_listbox = tk.Listbox(self.left_frame, exportselection=False)
        self.plant_listbox.pack(fill=tk.BOTH, expand=True, pady=5)
        self.plant_listbox.bind('<<ListboxSelect>>', self.on_plant_select)
        
        ttk.Button(self.left_frame, text="Add Plant", command=self.add_plant).pack(fill=tk.X)
        ttk.Button(self.left_frame, text="Delete Plant", command=self.delete_plant).pack(fill=tk.X)

        # Right Pane: Tasks
        self.right_frame = ttk.Frame(self.paned_window)
        self.paned_window.add(self.right_frame, weight=3)
        
        self.plant_label = ttk.Label(self.right_frame, text="Select a plant", font=('', 14, 'bold'))
        self.plant_label.pack(anchor=tk.W, pady=(0, 10))

        self.tasks_tree = ttk.Treeview(self.right_frame, columns=("Name", "Month", "Done"), show="headings")
        self.tasks_tree.heading("Name", text="Task Name")
        self.tasks_tree.heading("Month", text="Month")
        self.tasks_tree.heading("Done", text="Done")
        self.tasks_tree.pack(fill=tk.BOTH, expand=True)

        btn_frame = ttk.Frame(self.right_frame)
        btn_frame.pack(fill=tk.X, pady=5)
        ttk.Button(btn_frame, text="Add Task", command=self.add_task).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_frame, text="Edit Task", command=self.edit_task).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_frame, text="Delete Task", command=self.delete_task).pack(side=tk.LEFT, padx=2)

    def open_file(self):
        filepath = filedialog.askopenfilename(filetypes=[("JSON files", "*.json"), ("All files", "*.*")])
        if filepath:
            try:
                with open(filepath, 'r') as f:
                    self.data = json.load(f)
                self.current_file = filepath
                self.load_plant_list()
                self.title(f"Garden Data Editor - {os.path.basename(filepath)}")
            except Exception as e:
                messagebox.showerror("Error", f"Could not open file: {e}")

    def save_file(self):
        if self.current_file:
            self._save_to_path(self.current_file)
        else:
            self.save_file_as()

    def save_file_as(self):
        filepath = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON files", "*.json")])
        if filepath:
            self._save_to_path(filepath)
            self.current_file = filepath
            self.title(f"Garden Data Editor - {os.path.basename(filepath)}")

    def _save_to_path(self, filepath):
        try:
            with open(filepath, 'w') as f:
                json.dump(self.data, f, indent=4)
            messagebox.showinfo("Success", "File saved successfully.")
        except Exception as e:
            messagebox.showerror("Error", f"Could not save file: {e}")

    def load_plant_list(self):
        self.plant_listbox.delete(0, tk.END)
        for plant in self.data.get('plants', []):
            self.plant_listbox.insert(tk.END, plant.get('name', 'Unknown'))

    def get_selected_plant_index(self):
        selection = self.plant_listbox.curselection()
        return selection[0] if selection else None

    def on_plant_select(self, event):
        idx = self.get_selected_plant_index()
        self.tasks_tree.delete(*self.tasks_tree.get_children())
        if idx is not None:
            plant = self.data['plants'][idx]
            self.plant_label.config(text=plant.get('name', ''))
            for i, task in enumerate(plant.get('tasks', [])):
                self.tasks_tree.insert('', tk.END, iid=i, values=(
                    task.get('name'), 
                    task.get('month'), 
                    "Yes" if task.get('isDone') else "No"
                ))
        else:
            self.plant_label.config(text="Select a plant")

    def add_plant(self):
        self.data.setdefault('plants', []).append({'name': 'New Plant', 'tasks': []})
        self.load_plant_list()
        self.plant_listbox.selection_set(tk.END)
        self.on_plant_select(None)

    def delete_plant(self):
        idx = self.get_selected_plant_index()
        if idx is not None:
            name = self.data['plants'][idx].get('name', 'this plant')
            if messagebox.askyesno("Confirm Delete", f"Delete '{name}' and all its tasks?"):
                del self.data['plants'][idx]
                self.load_plant_list()
                self.on_plant_select(None)
        else:
            messagebox.showwarning("Warning", "Select a plant to delete.")

    def add_task(self):
        idx = self.get_selected_plant_index()
        if idx is not None:
            TaskDialog(self, on_save=lambda t: (self.data['plants'][idx]['tasks'].append(t), self.on_plant_select(None)))
        else:
            messagebox.showwarning("Warning", "Select a plant first.")

    def edit_task(self):
        idx = self.get_selected_plant_index()
        selection = self.tasks_tree.selection()
        if idx is not None and selection:
            t_idx = int(selection[0])
            task = self.data['plants'][idx]['tasks'][t_idx]
            def update(t):
                self.data['plants'][idx]['tasks'][t_idx] = t
                self.on_plant_select(None)
            TaskDialog(self, task_data=task, on_save=update)

    def delete_task(self):
        plant_idx = self.get_selected_plant_index()
        selection = self.tasks_tree.selection()
        if plant_idx is not None and selection:
            task_idx = int(selection[0])
            if messagebox.askyesno("Confirm", "Delete this task?"):
                del self.data['plants'][plant_idx]['tasks'][task_idx]
                self.on_plant_select(None)

if __name__ == "__main__":
    app = GardenEditor()
    app.mainloop()