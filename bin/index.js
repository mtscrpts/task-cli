#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import url from 'url';
const program = new Command();


const { readFile, writeFile } = fs.promises;
// get current file - /Users/maylyntalampas/Dev/node-projects/task-cli/index.js
const __filename = url.fileURLToPath(import.meta.url);
// get current file dir - /Users/maylyntalampas/Dev/node-projects/task-cli
const __dirname = path.dirname(__filename);
// get task file inside current dir - /Users/maylyntalampas/Dev/node-projects/task-cli/tasks.json
const FILE = path.join(process.cwd(), 'tasks.json');


async function loadTasks() {
    try {
        const data = await readFile(FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        console.error(`Error loading tasks: ${err}`);
        return [];
    }
}

async function saveTasks(tasks) {
    try {
        await writeFile(FILE, JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.error(`Error saving tasks: ${err}`);
    }
}

async function addTask(text) {
    const tasks = await loadTasks();
    tasks.push({ id: Date.now(), text, done: false});
    await saveTasks(tasks);
    console.log(`Added: "${text}"`);
}

async function listTasks() {
    const tasks = await loadTasks();
    if (tasks.length === 0) return console.log('No tasks yet.');
    tasks.forEach(task => {
        console.log(`${task.done ? '[x]' : '[ ]'} ${task.id} - ${task.text}`);
    });
}

async function completeTask(id) {
    const tasks = await loadTasks();
    const task = tasks.find(t => t.id === Number(id));
    if (!task) return console.log(`Task not found.`);
    task.done = true;
    await saveTasks(tasks);
    console.log(`Completed: "${task.text}"`);
}

async function deleteTask(id) {
    const tasks = await loadTasks();
    const index = tasks.findIndex(t => t.id === Number(id));
    if (index < 0) return console.log('Task not found.');
    await tasks.splice(index, 1);
    saveTasks(tasks);
    console.log("Task deleted.");

}

// parse args using commander
program
    .name('task-util')
    .description('CLI to manage tasks')
    .version('0.1.0');

program.command('add')
    .description('Add a task')
    .argument('<task description>', 'Task description')
    .action((task) => {
        addTask(task);
    });

program.command('list')
    .description('List tasks')
    .action(() => {
        listTasks();
    });

program.command('delete')
    .description('Delete task')
    .argument('<task id>', 'Task ID')
    .action((id) => {
        deleteTask(id);
    });

program.command('complete')
    .description('Mark task as done')
    .argument('<task id>', 'Task ID')
    .action((id) => {
        completeTask(id);
    });

program.parse();