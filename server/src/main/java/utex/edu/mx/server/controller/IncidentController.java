package utex.edu.mx.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.dto.ApiResponse;
import utex.edu.mx.server.model.Incident;
import utex.edu.mx.server.repository.IncidentRepository;
import utex.edu.mx.server.repository.RoomRepository;
import utex.edu.mx.server.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {
    
    @Autowired
    private IncidentRepository incidentRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Incident>>> getAllIncidents() {
        List<Incident> incidents = incidentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(incidents));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Incident>> getIncidentById(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(incident -> ResponseEntity.ok(ApiResponse.success(incident)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Incident not found")));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Incident>>> getIncidentsByUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    List<Incident> incidents = incidentRepository.findByReportedByOrderByCreatedAtDesc(user);
                    return ResponseEntity.ok(ApiResponse.success(incidents));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found")));
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<Incident>>> getIncidentsByRoom(@PathVariable Long roomId) {
        return roomRepository.findById(roomId)
                .map(room -> {
                    List<Incident> incidents = incidentRepository.findByRoomOrderByCreatedAtDesc(room);
                    return ResponseEntity.ok(ApiResponse.success(incidents));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Room not found")));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Incident>> createIncident(@RequestBody Incident incident) {
        try {
            // Validate room exists
            if (incident.getRoom() == null || !roomRepository.existsById(incident.getRoom().getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid room"));
            }
            
            // Validate user exists
            if (incident.getReportedBy() == null || !userRepository.existsById(incident.getReportedBy().getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid user"));
            }
            
            // Validate maximum 3 photos
            int photoCount = 0;
            if (incident.getPhoto1() != null && !incident.getPhoto1().isEmpty()) photoCount++;
            if (incident.getPhoto2() != null && !incident.getPhoto2().isEmpty()) photoCount++;
            if (incident.getPhoto3() != null && !incident.getPhoto3().isEmpty()) photoCount++;
            
            if (photoCount > 3) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Maximum 3 photos allowed"));
            }
            
            Incident savedIncident = incidentRepository.save(incident);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedIncident, "Incident created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create incident: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Incident>> updateIncident(@PathVariable Long id, @RequestBody Incident incidentDetails) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incident.setCategory(incidentDetails.getCategory());
                    incident.setDescription(incidentDetails.getDescription());
                    incident.setStatus(incidentDetails.getStatus());
                    incident.setResolution(incidentDetails.getResolution());
                    incident.setResolvedBy(incidentDetails.getResolvedBy());
                    incident.setResolvedAt(incidentDetails.getResolvedAt());
                    
                    // Update photos if provided
                    if (incidentDetails.getPhoto1() != null) incident.setPhoto1(incidentDetails.getPhoto1());
                    if (incidentDetails.getPhoto2() != null) incident.setPhoto2(incidentDetails.getPhoto2());
                    if (incidentDetails.getPhoto3() != null) incident.setPhoto3(incidentDetails.getPhoto3());
                    
                    incident.setSynced(true);
                    
                    Incident updatedIncident = incidentRepository.save(incident);
                    return ResponseEntity.ok(ApiResponse.success(updatedIncident, "Incident updated successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Incident not found")));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteIncident(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incidentRepository.delete(incident);
                    return ResponseEntity.ok(ApiResponse.success("Incident deleted successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Incident not found")));
    }
}
