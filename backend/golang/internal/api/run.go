package api

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"

	"backend/internal/env"

	"github.com/go-chi/jwtauth"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Run() {
	if err := env.Load(); err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, env.GetDatabaseConnection())
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatal(err)
	}

	var auth *jwtauth.JWTAuth
	// Define a secret key for signing the JWT tokens
	jwtSecret := env.Get(env.JWT_SECRET)
	auth = jwtauth.New("HS256", []byte(jwtSecret), nil)

	handler := NewApi(pool, auth)

	go func() {
		log.Println("Server started at :8080")
		if err := http.ListenAndServe(":8080", handler); err != nil {
			if !errors.Is(err, http.ErrServerClosed) {
				log.Fatal(err)
			}
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}
