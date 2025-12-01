package utex.edu.mx.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.dto.ApiResponse;
import utex.edu.mx.server.model.Room;
import utex.edu.mx.server.repository.RoomRepository;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "*")
public class RoomController {
    
    @Autowired
    private RoomRepository roomRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Room>>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Room>> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(room -> ResponseEntity.ok(ApiResponse.success(room)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Room not found")));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Room>> createRoom(@RequestBody Room room) {
        try {
            if (roomRepository.existsByNumber(room.getNumber())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Room number already exists"));
            }
            Room savedRoom = roomRepository.save(room);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedRoom, "Room created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create room: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Room>> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        return roomRepository.findById(id)
                .map(room -> {
                    room.setNumber(roomDetails.getNumber());
                    room.setBuilding(roomDetails.getBuilding());
                    room.setFloor(roomDetails.getFloor());
                    room.setType(roomDetails.getType());
                    room.setCleaningStatus(roomDetails.getCleaningStatus());
                    room.setOccupancyStatus(roomDetails.getOccupancyStatus());
                    room.setBeds(roomDetails.getBeds());
                    room.setPrice(roomDetails.getPrice());
                    Room updatedRoom = roomRepository.save(room);
                    return ResponseEntity.ok(ApiResponse.success(updatedRoom, "Room updated successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Room not found")));
    }
    
    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<ApiResponse<Room>> getRoomByQR(@PathVariable String qrCode) {
        return roomRepository.findByQrCode(qrCode)
                .map(room -> ResponseEntity.ok(ApiResponse.success(room)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Room not found with this QR code")));
    }
    
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<ApiResponse<List<Room>>> getRoomsByBuilding(@PathVariable Long buildingId) {
        List<Room> rooms = roomRepository.findByBuildingId(buildingId);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @GetMapping("/status/cleaning/{status}")
    public ResponseEntity<ApiResponse<List<Room>>> getRoomsByCleaningStatus(@PathVariable String status) {
        try {
            Room.CleaningStatus cleaningStatus = Room.CleaningStatus.valueOf(status.toUpperCase());
            List<Room> rooms = roomRepository.findByCleaningStatus(cleaningStatus);
            return ResponseEntity.ok(ApiResponse.success(rooms));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid cleaning status"));
        }
    }
    
    @GetMapping("/status/occupancy/{status}")
    public ResponseEntity<ApiResponse<List<Room>>> getRoomsByOccupancyStatus(@PathVariable String status) {
        try {
            Room.OccupancyStatus occupancyStatus = Room.OccupancyStatus.valueOf(status.toUpperCase());
            List<Room> rooms = roomRepository.findByOccupancyStatus(occupancyStatus);
            return ResponseEntity.ok(ApiResponse.success(rooms));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid occupancy status"));
        }
    }
    
    @PutMapping("/{id}/cleaning-status")
    public ResponseEntity<ApiResponse<Room>> updateCleaningStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        return roomRepository.findById(id)
                .map(room -> {
                    try {
                        Room.CleaningStatus cleaningStatus = Room.CleaningStatus.valueOf(status.toUpperCase());
                        room.setCleaningStatus(cleaningStatus);
                        Room updatedRoom = roomRepository.save(room);
                        return ResponseEntity.ok(ApiResponse.success(updatedRoom, "Cleaning status updated"));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.<Room>error("Invalid cleaning status"));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Room not found")));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteRoom(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(room -> {
                    roomRepository.delete(room);
                    return ResponseEntity.ok(ApiResponse.success("Room deleted successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Room not found")));
    }
}
