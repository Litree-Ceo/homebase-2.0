// In-memory task storage (for demo purposes)
let tasks = [
    { id: 1, title: "Welcome to HomeBase 2.0", completed: false, createdAt: new Date().toISOString() },
    { id: 2, title: "Explore the dashboard", completed: false, createdAt: new Date().toISOString() }
];

module.exports = async function (context, req) {
    context.log('Tasks endpoint called:', req.method);

    if (req.method === 'GET') {
        // Get all tasks
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: tasks
        };
    } 
    else if (req.method === 'POST') {
        // Create new task
        const newTask = {
            id: tasks.length + 1,
            title: req.body.title || "New Task",
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        
        context.res = {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
            body: newTask
        };
    }
};
