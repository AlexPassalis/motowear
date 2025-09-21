.PHONY: 64 git-crypt lines-code docker-dev docker

64:
	openssl rand -base64 64

git-crypt:
	git-crypt status -e

lines-code:
	git ls-files | xargs wc -l

docker-dev:
	docker build -t image-motowear-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build -t image-motowear-typesense -f ./services/typesense/Dockerfile ./services/typesense
	docker build --target dev -t image-motowear-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	docker build -t image-motowear-nginx -f ./services/nginx/Dockerfile ./services/nginx
	# docker network create -d overlay network-motowear
	docker stack deploy -c ./docker-stack-dev.yaml --detach=false --with-registry-auth stack-motowear

docker:
	docker build -t image-motowear-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build -t image-motowear-typesense -f ./services/typesense/Dockerfile ./services/typesense
	docker build -t image-motowear-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	docker build -t image-motowear-nginx -f ./services/nginx/Dockerfile ./services/nginx
	# docker network create -d overlay network-motowear
	docker stack deploy -c ./docker-stack.yaml --detach=false --resolve-image always --with-registry-auth stack-motowear
