package com.boot.researchassistantbackend.Configuration;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ai.chat.client.ChatClient;

@Configuration
public class OllamaModel {

    @Bean
    public ChatClient ollamaChatClient(OllamaChatModel ollamaChatClientModel){
        ChatClient.Builder builder = ChatClient.builder(ollamaChatClientModel);
        return builder.build();
    }
}
