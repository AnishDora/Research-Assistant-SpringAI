package com.boot.researchassistantbackend.Controller;

import com.boot.researchassistantbackend.Service.ResearchResponseService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/research")
public class ResearchResponseController {

    public final ResearchResponseService researchResponseService;

    public ResearchResponseController(ResearchResponseService researchResponseService) {
        this.researchResponseService = researchResponseService;
    }

    @PostMapping("/generateResponse")
    public ResponseEntity<String> generateResearchResponse(@RequestBody Map<String,String> requestBody){
        String content = requestBody.get("content");
        String operation = requestBody.get("operation");
        String responseString = researchResponseService.researchResponseGenerator(content,operation);
        return ResponseEntity.ok(responseString);
    }


}
