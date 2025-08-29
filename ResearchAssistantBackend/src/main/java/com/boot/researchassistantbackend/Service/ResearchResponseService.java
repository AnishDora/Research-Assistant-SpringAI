package com.boot.researchassistantbackend.Service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class ResearchResponseService {

    public final ChatClient ollamaModel;

    @Value("classpath:prompts/prompt.st")
    public Resource resource;

    public ResearchResponseService(ChatClient ollamaModel) {
        this.ollamaModel = ollamaModel;
    }

    public String researchResponseGenerator(String content, String operation){
        return ollamaModel
                .prompt()
                .user(promptUserSpec ->
                        promptUserSpec
                                .text(resource)
                                .param("message", content)
                                .param("operation", operation)
                )
                .call()
                .content();
    }
}
