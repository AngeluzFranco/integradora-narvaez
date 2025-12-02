package utex.edu.mx.server.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.dto.WebSocketNotification;
import utex.edu.mx.server.model.Room;
import utex.edu.mx.server.repository.RoomRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class RoomController {
    
    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<List<Room>> getRoomsByBuilding(@PathVariable Long buildingId) {
        return ResponseEntity.ok(roomRepository.findByBuildingId(buildingId));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Room>> getRoomsByStatus(@PathVariable Room.RoomStatus status) {
        return ResponseEntity.ok(roomRepository.findByStatus(status));
    }
    
    @GetMapping("/maid/{maidId}")
    public ResponseEntity<List<Room>> getRoomsByMaid(@PathVariable Long maidId) {
        return ResponseEntity.ok(roomRepository.findByAssignedToId(maidId));
    }
    
    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(roomRepository.save(room));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        return roomRepository.findById(id)
                .map(room -> {
                    room.setNumber(roomDetails.getNumber());
                    room.setFloor(roomDetails.getFloor());
                    room.setStatus(roomDetails.getStatus());
                    room.setAssignedTo(roomDetails.getAssignedTo());
                    room.setAssignedAt(roomDetails.getAssignedAt());
                    room.setUpdatedAt(LocalDateTime.now());
                    Room updatedRoom = roomRepository.save(room);
                    
                    // Broadcast WebSocket notification
                    WebSocketNotification notification = new WebSocketNotification(
                        "ROOM_UPDATED",
                        "Habitación " + updatedRoom.getNumber() + " actualizada",
                        updatedRoom
                    );
                    messagingTemplate.convertAndSend("/topic/rooms", notification);
                    
                    return ResponseEntity.ok(updatedRoom);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Room> updateRoomStatus(@PathVariable Long id, @RequestBody Room.RoomStatus status) {
        return roomRepository.findById(id)
                .map(room -> {
                    room.setStatus(status);
                    room.setUpdatedAt(LocalDateTime.now());
                    Room updatedRoom = roomRepository.save(room);
                    
                    // Broadcast WebSocket notification
                    WebSocketNotification notification = new WebSocketNotification(
                        "ROOM_STATUS_CHANGED",
                        "Habitación " + updatedRoom.getNumber() + " ahora está " + status,
                        updatedRoom
                    );
                    messagingTemplate.convertAndSend("/topic/rooms", notification);
                    messagingTemplate.convertAndSend("/topic/notifications", notification);
                    
                    return ResponseEntity.ok(updatedRoom);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(room -> {
                    roomRepository.delete(room);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
