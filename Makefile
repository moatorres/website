%: # Prevents make from failing when an unknown target is called
  @:

.PHONY: help
help:
	@echo ""
	@echo "\033[1;32m clean     \033[0m \033[1;30m  Cleans the workspace (removes node_modules, dist, .next, out-tsc)\033[0m"
	@echo "\033[1;32m fresh     \033[0m \033[1;30m  Rebuilds dependencies, artifacts, and lock file\033[0m"
	@echo "\033[1;32m sync      \033[0m \033[1;30m  Synchronizes dependencies and fixes mismatches\033[0m"
	@echo "\033[1;32m tidy      \033[0m \033[1;30m  Lints, updates copyright headers, and formats the codebase\033[0m"
	@echo "\033[1;32m update    \033[0m \033[1;30m  Updates dependencies to their latest versions and formats affected files\033[0m"

.PHONY: clean
clean:
	@read -p "Are you sure you want to delete \"node_modules, dist, .next, and out-tsc\"? (y/N) " confirm && \
	if [ "$$confirm" = "y" ]; then \
		find . -type d \( -name "node_modules" -o -name "dist" -o -name ".next" -o -name "out-tsc" \) -exec rm -rf {} +; \
	else \
		echo "Command 'make clean' cancelled."; \
	fi

.PHONY: fresh
fresh:
	@echo "\n\033[1;31mWARNING:\033[0m This will delete ALL build artifacts, dependencies, and pnpm-lock.yaml files.\n"; \
  read -p "Are you sure you want to delete \"pnpm-lock.yaml\" file? (y/N) " confirm && \
	if [ "$$confirm" = "y" ]; then \
		make clean && \
		find . -type f \( -name "pnpm-lock.yaml" \) -exec rm -rf {} + && \
		pnpm install; \
	else \
		echo "Command 'make fresh' cancelled."; \
	fi

.PHONY: sync
sync:
	@pnpm exec -- nx sync
	@pnpm exec -- syncpack fix-mismatches
	@pnpm install

.PHONY: tidy
tidy:
	@pnpm lint --fix
	@pnpm format

.PHONY: update
update:
	@pnpm up --latest --loglevel=warning
	@pnpm affected

