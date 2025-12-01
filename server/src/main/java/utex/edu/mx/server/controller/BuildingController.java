package utex.edu.mx.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.dto.ApiResponse;
import utex.edu.mx.server.model.Building;
import utex.edu.mx.server.repository.BuildingRepository;
import utex.edu.mx.server.repository.HotelRepository;

import java.util.List;

@RestController
@RequestMapping("/buildings")
@CrossOrigin(origins = "*")
public class BuildingController {
    
    @Autowired
    private BuildingRepository buildingRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Building>>> getAllBuildings() {
        List<Building> buildings = buildingRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(buildings));
    }
    
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse<List<Building>>> getBuildingsByHotel(@PathVariable Long hotelId) {
        List<Building> buildings = buildingRepository.findByHotelId(hotelId);
        return ResponseEntity.ok(ApiResponse.success(buildings));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Building>> getBuildingById(@PathVariable Long id) {
        return buildingRepository.findById(id)
                .map(building -> ResponseEntity.ok(ApiResponse.success(building)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Building not found")));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Building>> createBuilding(@RequestBody Building building) {
        try {
            // Validate hotel exists
            if (building.getHotel() == null || !hotelRepository.existsById(building.getHotel().getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid hotel"));
            }
            
            Building savedBuilding = buildingRepository.save(building);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedBuilding, "Building created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create building: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Building>> updateBuilding(@PathVariable Long id, @RequestBody Building buildingDetails) {
        return buildingRepository.findById(id)
                .map(building -> {
                    building.setName(buildingDetails.getName());
                    building.setFloors(buildingDetails.getFloors());
                    if (buildingDetails.getHotel() != null) {
                        building.setHotel(buildingDetails.getHotel());
                    }
                    Building updatedBuilding = buildingRepository.save(building);
                    return ResponseEntity.ok(ApiResponse.success(updatedBuilding, "Building updated successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Building not found")));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteBuilding(@PathVariable Long id) {
        return buildingRepository.findById(id)
                .map(building -> {
                    buildingRepository.delete(building);
                    return ResponseEntity.ok(ApiResponse.success("Building deleted successfully"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Building not found")));
    }
}
