package utex.edu.mx.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import utex.edu.mx.server.dto.ApiResponse;
import utex.edu.mx.server.model.Assignment;
import utex.edu.mx.server.model.User;
import utex.edu.mx.server.repository.AssignmentRepository;
import utex.edu.mx.server.security.CustomUserDetailsService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Assignment>>> getAssignments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userDetailsService.getUserByUsername(username);
        
        List<Assignment> assignments;
        
        if (user.getRole() == User.Role.MAID) {
            // Maids only see their own assignments
            if (date != null) {
                assignments = assignmentRepository.findByMaidAndAssignmentDate(user, date);
            } else {
                assignments = assignmentRepository.findByMaid(user);
            }
        } else {
            // Admins see all assignments
            if (date != null) {
                assignments = assignmentRepository.findByAssignmentDate(date);
            } else {
                assignments = assignmentRepository.findAll();
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Assignment>> createAssignment(@RequestBody Assignment assignment) {
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(savedAssignment, "Assignment created"));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Assignment>> updateAssignment(
            @PathVariable Long id,
            @RequestBody Assignment assignmentDetails,
            Authentication authentication) {
        
        return assignmentRepository.findById(id)
                .map(assignment -> {
                    String username = authentication.getName();
                    User user = userDetailsService.getUserByUsername(username);
                    
                    // Maids can only update their own assignments
                    if (user.getRole() == User.Role.MAID && 
                        !assignment.getMaid().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .<ApiResponse<Assignment>>body(ApiResponse.error("Unauthorized"));
                    }
                    
                    assignment.setStatus(assignmentDetails.getStatus());
                    assignment.setStartedAt(assignmentDetails.getStartedAt());
                    assignment.setCompletedAt(assignmentDetails.getCompletedAt());
                    assignment.setNotes(assignmentDetails.getNotes());
                    
                    Assignment updated = assignmentRepository.save(assignment);
                    return ResponseEntity.ok(ApiResponse.success(updated, "Assignment updated"));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Assignment not found")));
    }
}
