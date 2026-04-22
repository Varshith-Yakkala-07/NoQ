# import cv2
# import torch
# import time
# import threading
# from ultralytics import YOLO
# from fastapi import FastAPI
# from contextlib import asynccontextmanager

# # -------- DEVICE --------
# device = '0' if torch.cuda.is_available() else 'cpu'
# print(f"Using device: {device}")

# # -------- ONE MODEL, ONE VIDEO --------
# model = YOLO("yolov8m.pt")

# # -------- SHARED STATE --------
# shared_data = {"count": 0, "status": "low", "last_updated": 0}
# state_lock = threading.Lock()

# # -------- STATUS --------
# def get_status(count, capacity=20):
#     percentage = (count / capacity) * 100

#     if percentage < 35:
#         return "low"
#     elif percentage < 65:
#         return "medium"
#     else:
#         return "high"

# # -------- SINGLE VIDEO LOOP --------
# def run_video_loop():
#     print("Video loop thread started!")
#     cap = cv2.VideoCapture("video2.mp4")

#     fps = cap.get(cv2.CAP_PROP_FPS)
#     if not fps or fps == 0:
#         fps = 25
#     frame_delay = 1 / fps
#     print(f"FPS: {fps}")

#     DETECTION_INTERVAL = 3
#     last_detection_time = 0
#     last_ids = set()

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             print("Video ended, restarting...")
#             cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
#             last_ids = set()
#             continue

#         current_time = time.time()

#         if current_time - last_detection_time >= DETECTION_INTERVAL:
#             results = model.track(
#                 frame,
#                 persist=True,
#                 classes=[0],
#                 conf=0.4,
#                 device=device,
#                 verbose=False
#             )

#             current_ids = set()
#             for r in results:
#                 if r.boxes.id is not None:
#                     ids = r.boxes.id.cpu().numpy().astype(int)
#                     for track_id in ids:
#                         current_ids.add(track_id)

#             last_ids = current_ids
#             last_detection_time = current_time
#             count = len(last_ids)

#             with state_lock:
#                 shared_data["count"] = count
#                 shared_data["status"] = get_status(count)
#                 shared_data["last_updated"] = current_time

#             print(f"Count updated: {count}")

#         time.sleep(frame_delay)

#     cap.release()

# # -------- LIFESPAN (replaces on_event startup) --------
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     thread = threading.Thread(target=run_video_loop, daemon=True)
#     thread.start()
#     print("Video loop started!")
#     yield  # app runs here
#     print("Shutting down...")

# app = FastAPI(lifespan=lifespan)

# # -------- HELPER --------
# def make_response(zone, count, status):
#     return {
#         "zone": zone,
#         "count": count,
#         "capacity": 20,
#         "status": status,
#     }

# # -------- INDIVIDUAL ENDPOINTS --------
# @app.get("/data1")
# def get_hall1():
#     with state_lock:
#         return make_response("Dining Hall 1", shared_data["count"], shared_data["status"])

# @app.get("/data2")
# def get_hall2():
#     with state_lock:
#         return make_response("Dining Hall 2", shared_data["count"], shared_data["status"])

# @app.get("/data3")
# def get_hall3():
#     with state_lock:
#         return make_response("Dining Hall 3", shared_data["count"], shared_data["status"])

# @app.get("/data4")
# def get_hall4():
#     with state_lock:
#         return make_response("Dining Hall 4", shared_data["count"], shared_data["status"])

# # -------- ALL HALLS ENDPOINT --------
# @app.get("/all")
# def get_all():
#     with state_lock:
#         count = shared_data["count"]
#         status = shared_data["status"]

#     return {
#         "hall1": make_response("Dining Hall 1", count, status),
#         "hall2": make_response("Dining Hall 2", count, status),
#         "hall3": make_response("Dining Hall 3", count, status),
#         "hall4": make_response("Dining Hall 4", count, status),
#     }