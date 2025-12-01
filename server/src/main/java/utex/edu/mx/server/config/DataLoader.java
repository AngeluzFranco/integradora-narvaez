package utex.edu.mx.server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import utex.edu.mx.server.model.*;
import utex.edu.mx.server.repository.*;

import java.time.LocalDate;
import java.util.UUID;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private BuildingRepository buildingRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create users
        if (userRepository.count() == 0) {
            User maria = new User();
            maria.setUsername("maria");
            maria.setPassword(passwordEncoder.encode("1234"));
            maria.setName("María González");
            maria.setEmail("maria@hotel.com");
            maria.setPhone("555-0001");
            maria.setRole(User.Role.MAID);
            userRepository.save(maria);
            
            User ana = new User();
            ana.setUsername("ana");
            ana.setPassword(passwordEncoder.encode("1234"));
            ana.setName("Ana Martínez");
            ana.setEmail("ana@hotel.com");
            ana.setPhone("555-0002");
            ana.setRole(User.Role.MAID);
            userRepository.save(ana);
            
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setName("Administrador");
            admin.setEmail("admin@hotel.com");
            admin.setPhone("555-0100");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            
            System.out.println("✅ Users created successfully");
        }
        
        // Create hotels (multi-hotel support)
        if (hotelRepository.count() == 0) {
            Hotel hotel1 = new Hotel();
            hotel1.setName("Hotel Plaza Central");
            hotel1.setAddress("Av. Principal 123, Centro");
            hotel1.setPhone("555-1000");
            hotel1.setEmail("info@plazacentral.com");
            hotel1.setActive(true);
            hotelRepository.save(hotel1);
            
            Hotel hotel2 = new Hotel();
            hotel2.setName("Hotel Costa Azul");
            hotel2.setAddress("Blvd. Costero 456, Playa");
            hotel2.setPhone("555-2000");
            hotel2.setEmail("info@costaazul.com");
            hotel2.setActive(true);
            hotelRepository.save(hotel2);
            
            System.out.println("✅ Hotels created successfully");
        }
        
        // Create buildings
        if (buildingRepository.count() == 0) {
            Hotel hotel1 = hotelRepository.findByName("Hotel Plaza Central").orElseThrow();
            Hotel hotel2 = hotelRepository.findByName("Hotel Costa Azul").orElseThrow();
            
            Building buildingA1 = new Building();
            buildingA1.setHotel(hotel1);
            buildingA1.setName("Edificio A");
            buildingA1.setFloors(3);
            buildingRepository.save(buildingA1);
            
            Building buildingB1 = new Building();
            buildingB1.setHotel(hotel1);
            buildingB1.setName("Edificio B");
            buildingB1.setFloors(3);
            buildingRepository.save(buildingB1);
            
            Building buildingA2 = new Building();
            buildingA2.setHotel(hotel2);
            buildingA2.setName("Torre Norte");
            buildingA2.setFloors(5);
            buildingRepository.save(buildingA2);
            
            System.out.println("✅ Buildings created successfully");
        }
        
        // Create rooms with QR codes
        if (roomRepository.count() == 0) {
            Building buildingA1 = buildingRepository.findByHotelId(1L).get(0);
            Building buildingB1 = buildingRepository.findByHotelId(1L).get(1);
            Building buildingA2 = buildingRepository.findByHotelId(2L).get(0);
            
            // Hotel 1 - Edificio A
            for (int i = 1; i <= 10; i++) {
                Room room = new Room();
                room.setBuilding(buildingA1);
                room.setNumber("A-10" + i);
                room.setFloor(1);
                room.setType(i <= 2 ? "Suite" : "Estándar");
                room.setCleaningStatus(i % 3 == 0 ? Room.CleaningStatus.CLEAN : Room.CleaningStatus.DIRTY);
                room.setOccupancyStatus(i % 4 == 0 ? Room.OccupancyStatus.OCCUPIED : Room.OccupancyStatus.AVAILABLE);
                room.setBeds(i <= 2 ? 2 : 1);
                room.setPrice(i <= 2 ? 2000.0 : 1200.0);
                room.setQrCode("QR-" + UUID.randomUUID().toString().substring(0, 8));
                roomRepository.save(room);
            }
            
            // Hotel 1 - Edificio B
            for (int i = 1; i <= 10; i++) {
                Room room = new Room();
                room.setBuilding(buildingB1);
                room.setNumber("B-20" + i);
                room.setFloor(2);
                room.setType("Estándar");
                room.setCleaningStatus(i % 2 == 0 ? Room.CleaningStatus.CLEAN : Room.CleaningStatus.DIRTY);
                room.setOccupancyStatus(Room.OccupancyStatus.AVAILABLE);
                room.setBeds(2);
                room.setPrice(1500.0);
                room.setQrCode("QR-" + UUID.randomUUID().toString().substring(0, 8));
                roomRepository.save(room);
            }
            
            // Hotel 2 - Torre Norte
            for (int i = 1; i <= 8; i++) {
                Room room = new Room();
                room.setBuilding(buildingA2);
                room.setNumber("TN-30" + i);
                room.setFloor(3);
                room.setType(i <= 3 ? "Suite Premium" : "Deluxe");
                room.setCleaningStatus(Room.CleaningStatus.CLEAN);
                room.setOccupancyStatus(Room.OccupancyStatus.AVAILABLE);
                room.setBeds(2);
                room.setPrice(i <= 3 ? 3500.0 : 2500.0);
                room.setQrCode("QR-" + UUID.randomUUID().toString().substring(0, 8));
                roomRepository.save(room);
            }
            
            System.out.println("✅ Rooms created successfully with QR codes");
        }
        
        // Create sample assignments
        if (assignmentRepository.count() == 0) {
            User maria = userRepository.findByUsername("maria").orElseThrow();
            User ana = userRepository.findByUsername("ana").orElseThrow();
            
            Room room1 = roomRepository.findByNumber("A-101").orElseThrow();
            Room room2 = roomRepository.findByNumber("A-102").orElseThrow();
            Room room3 = roomRepository.findByNumber("B-201").orElseThrow();
            
            Assignment assignment1 = new Assignment();
            assignment1.setRoom(room1);
            assignment1.setMaid(maria);
            assignment1.setAssignmentDate(LocalDate.now());
            assignment1.setStatus(Assignment.AssignmentStatus.PENDING);
            assignment1.setPriority(Assignment.Priority.NORMAL);
            assignment1.setNotes("Check-out a las 11:00");
            assignmentRepository.save(assignment1);
            
            Assignment assignment2 = new Assignment();
            assignment2.setRoom(room2);
            assignment2.setMaid(maria);
            assignment2.setAssignmentDate(LocalDate.now());
            assignment2.setStatus(Assignment.AssignmentStatus.PENDING);
            assignment2.setPriority(Assignment.Priority.HIGH);
            assignmentRepository.save(assignment2);
            
            Assignment assignment3 = new Assignment();
            assignment3.setRoom(room3);
            assignment3.setMaid(ana);
            assignment3.setAssignmentDate(LocalDate.now());
            assignment3.setStatus(Assignment.AssignmentStatus.PENDING);
            assignment3.setPriority(Assignment.Priority.NORMAL);
            assignmentRepository.save(assignment3);
            
            System.out.println("✅ Assignments created successfully");
        }
        
        System.out.println("\n========================================");
        System.out.println("🏨 HotelClean API is ready! (Multi-Hotel Support)");
        System.out.println("========================================");
        System.out.println("📍 API URL: http://localhost:8080/api");
        System.out.println("📊 H2 Console: http://localhost:8080/api/h2-console");
        System.out.println("\n👤 Test Users:");
        System.out.println("   - maria / 1234 (Maid)");
        System.out.println("   - ana / 1234 (Maid)");
        System.out.println("   - admin / admin (Admin)");
        System.out.println("\n🏨 Hotels:");
        System.out.println("   - Hotel Plaza Central (2 buildings)");
        System.out.println("   - Hotel Costa Azul (1 building)");
        System.out.println("========================================\n");
    }
}
