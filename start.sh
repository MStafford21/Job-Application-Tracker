#!/bin/bash
# start.sh — Start both backend and frontend

echo " Starting JobTracker..."
echo ""

# Start backend
echo " Starting .NET API (http://localhost:5000)..."
cd backend/JobTracker.API
dotnet run &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "  Starting React frontend (http://localhost:5173)..."
cd ../../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo " JobTracker is running!"
echo "   Frontend: http://localhost:5173"
echo "   API:      http://localhost:5000"
echo "   Swagger:  http://localhost:5000/swagger"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT
wait
