package utex.edu.mx.server.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.model.Incident;
import utex.edu.mx.server.repository.IncidentRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class IncidentController {
    
    private final IncidentRepository incidentRepository;
    
    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Incident>> getIncidentsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(incidentRepository.findByRoomId(roomId));
    }
    
    @GetMapping("/maid/{maidId}")
    public ResponseEntity<List<Incident>> getIncidentsByMaid(@PathVariable Long maidId) {
        return ResponseEntity.ok(incidentRepository.findByReportedById(maidId));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Incident>> getIncidentsByStatus(@PathVariable Incident.IncidentStatus status) {
        return ResponseEntity.ok(incidentRepository.findByStatus(status));
    }
    
    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(incidentRepository.save(incident));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Incident> updateIncident(@PathVariable Long id, @RequestBody Incident incidentDetails) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incident.setDescription(incidentDetails.getDescription());
                    incident.setSeverity(incidentDetails.getSeverity());
                    incident.setStatus(incidentDetails.getStatus());
                    incident.setResolutionNotes(incidentDetails.getResolutionNotes());
                    incident.setResolvedAt(incidentDetails.getResolvedAt());
                    incident.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(incidentRepository.save(incident));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id, @RequestBody String resolutionNotes) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incident.setStatus(Incident.IncidentStatus.RESOLVED);
                    incident.setResolutionNotes(resolutionNotes);
                    incident.setResolvedAt(LocalDateTime.now());
                    incident.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(incidentRepository.save(incident));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incidentRepository.delete(incident);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
