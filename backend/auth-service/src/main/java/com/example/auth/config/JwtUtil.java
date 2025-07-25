package com.example.auth.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;
import java.security.Key;

// Sigleton pattern
@Component
public class JwtUtil{

    private Key secretkey;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Value("${jwt.issuer}")
    private String issuer;

    @PostConstruct
    public void init(){
        this.secretkey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username){
        Key secretKey=this.secretkey;
        return Jwts.builder()
            .setIssuer(issuer)
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(secretKey,SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractUsername(String token){
        return extractClaims(token,Claims::getSubject);
    }

    public Date extractExpiration(String token){
        return extractClaims(token,Claims::getExpiration);
    }

    public <T> T extractClaims(String token,Function<Claims,T> claimsResolver){
        Key secretKey = this.secretkey;
        try{
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
        }
        catch(ExpiredJwtException e){
            throw new RuntimeException("Token expired.Please login again.");
        }
        catch(JwtException e){
            throw new RuntimeException("Token Invalid.");
        }
    }

    public boolean validateToken(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}