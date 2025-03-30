%: # Prevents make from failing when an unknown target is called
  @:

.PHONY: help
help:
	@echo ""
	@echo "\033[1;32m clean     \033[0m \033[1;30m  Cleans the workspace (removes node_modules, dist, .next, out-tsc)\033[0m"
	@echo "\033[1;32m bootstrap \033[0m \033[1;30m  Generates the medatada used in the blog application\033[0m"

.PHONY: clean
clean:
	@read -p "Are you sure you want to clean the workspace? This will delete node_modules, dist, .next, out-tsc. (y/N) " confirm && \
	if [ "$$confirm" = "y" ]; then \
		find . -type d \( -name "node_modules" -o -name "dist" -o -name ".next" -o -name "out-tsc" \) -exec rm -rf {} +; \
	else \
		echo "Clean cancelled."; \
	fi

.PHONY: bootstrap
bootstrap:
	NODE_OPTIONS=--no-warnings pnpm exec -- tsx --loader @mdx-js/node-loader apps/blog/src/utils/bootstrap.ts

.PHONY: build
build:
	make bootstrap && NODE_OPTIONS=--no-warnings pnpm exec -- nx build blog
