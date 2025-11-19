.PHONY: default start stop postgres-generate postgres-migrate 64 git-crypt lines-code ssh db-backup-cron clone-prod-db

default: start

start:
	docker build -t image-motowear-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build -t image-motowear-typesense -f ./services/typesense/Dockerfile ./services/typesense
	docker build --target dev -t image-motowear-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	docker build -t image-motowear-nginx -f ./services/nginx/Dockerfile ./services/nginx
	docker build -t image-motowear-prometheus -f ./services/prometheus/Dockerfile ./services/prometheus
	docker build -t image-motowear-grafana -f ./services/grafana/Dockerfile ./services/grafana
	# docker network create -d overlay network-motowear
	docker stack deploy -c ./docker-stack-dev.yaml --detach=false --with-registry-auth stack-motowear

stop:
	docker stack rm stack-motowear

postgres_generate:
	@echo "*** Creating database migrations."
	@bin/dockerize pnpm run postgres:generate

postgres_migrate:
	@echo "*** Applying database migrations."
	@bin/dockerize pnpm run postgres:migrate

64:
	openssl rand -base64 64

git_crypt:
	git-crypt status -e

lines_code:
	git ls-files | xargs wc -l

ssh:
	@bash ./bin/ssh

clone_prod_db:
	@bash ./bin/clone_prod_db
