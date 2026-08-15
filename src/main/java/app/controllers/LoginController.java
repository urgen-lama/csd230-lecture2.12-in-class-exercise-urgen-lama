package app.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    // Commented out to prevent conflict with React's SPA routes
    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
