# Variables
DBT_PROJECT_DIR = account_analysis
DASHBOARD_DIR = dashboard
DB_PATH = dashboard/db/analysis_db.duckdb
DATA_DIR = dashboard/public/data
TARGET_DATA_DIR = $(DBT_PROJECT_DIR)/target/data
DIST_DIR = $(DASHBOARD_DIR)/dist

# Environment checks
PYTHON_VERSION = $(shell python3 --version 2>/dev/null)
NODE_VERSION = $(shell node --version 2>/dev/null)

# Initialize directories and database
.PHONY: init
init:
	@echo "Checking environment..."
ifndef PYTHON_VERSION
	$(error "Python3 is not installed")
endif
ifndef NODE_VERSION
	$(error "Node.js is not installed")
endif
	@echo "Creating necessary directories..."
	@mkdir -p $(DATA_DIR)
	@mkdir -p $(DASHBOARD_DIR)/db
	@echo "Initializing project structure..."

# DBT processes
.PHONY: dbt-deps
dbt-deps:
	@echo "Installing dbt dependencies..."
	cd $(DBT_PROJECT_DIR) && dbt deps --profiles-dir .

.PHONY: dbt-seed
dbt-seed: dbt-deps
	@echo "Loading seed data..."
	cd $(DBT_PROJECT_DIR) && dbt seed --profiles-dir .

.PHONY: dbt-run
dbt-run: dbt-seed
	@echo "Running dbt models..."
	@mkdir -p $(TARGET_DATA_DIR)
	cd $(DBT_PROJECT_DIR) && dbt run --full-refresh --profiles-dir .

.PHONY: dbt-test
dbt-test: dbt-run
	@echo "Running dbt tests..."
	cd $(DBT_PROJECT_DIR) && dbt test --profiles-dir .

# dbt_project.yml changes
vars:
  json_path: "target/data"  # Change this to use target/data directory
  fiscal_year_start: 7
  top_account_percentile: 0.9
  analysis_lookback_days: 365

# Copy DBT artifacts to dashboard
.PHONY: copy-dbt-artifacts
copy-dbt-artifacts:
	@echo "Copying DBT artifacts to dashboard..."
	@rm -rf $(DATA_DIR)/*
	@mkdir -p $(DATA_DIR)
	@if [ -d "$(TARGET_DATA_DIR)" ]; then \
		cp -r $(TARGET_DATA_DIR)/* $(DATA_DIR)/; \
		echo "DBT artifacts copied successfully"; \
	else \
		@mkdir -p $(TARGET_DATA_DIR); \
		echo "Created target data directory"; \
	fi
	@echo "Ensuring export directory exists..."
	@mkdir -p $(DATA_DIR)


# Dashboard processes
.PHONY: install-dashboard
install-dashboard:
	@echo "Installing dashboard dependencies..."
	cd $(DASHBOARD_DIR) && npm ci

.PHONY: setup-dashboard
setup-dashboard: install-dashboard
	@echo "Configuring dashboard..."
	cd $(DASHBOARD_DIR) && npm run configure

.PHONY: dev-dashboard
dev-dashboard: setup-dashboard copy-dbt-artifacts
	@echo "Starting dashboard in development mode..."
	cd $(DASHBOARD_DIR) && npm run dev

.PHONY: build-dashboard
build-dashboard: setup-dashboard copy-dbt-artifacts
	@echo "Building dashboard for production..."
	cd $(DASHBOARD_DIR) && npm run build

# GitHub Pages specific tasks
.PHONY: prepare-gh-pages
prepare-gh-pages:
	@echo "Preparing for GitHub Pages deployment..."
	@if [ ! -f "$(DASHBOARD_DIR)/vite.config.js" ]; then \
		echo "Error: vite.config.js not found"; \
		exit 1; \
	fi
	@if [ ! -d "$(DIST_DIR)" ]; then \
		echo "Error: dist directory not found. Run build-dashboard first."; \
		exit 1; \
	fi

# Main workflow targets
.PHONY: build-data
build-data: init dbt-deps dbt-seed dbt-run dbt-test copy-dbt-artifacts

.PHONY: dev
dev: build-data dev-dashboard

.PHONY: build
build: build-data build-dashboard prepare-gh-pages

# Deployment targets
.PHONY: deploy-gh-pages
deploy-gh-pages: build
	@echo "Deploying to GitHub Pages..."
	@if [ -d "$(DIST_DIR)" ]; then \
		touch $(DIST_DIR)/.nojekyll; \
		echo "Deployment files prepared in $(DIST_DIR)"; \
		echo "Use GitHub Actions for actual deployment"; \
	else \
		echo "Error: $(DIST_DIR) not found"; \
		exit 1; \
	fi

# Cleaning targets
.PHONY: clean-dbt
clean-dbt:
	@echo "Cleaning DBT artifacts..."
	cd $(DBT_PROJECT_DIR) && dbt clean --profiles-dir .
	rm -f $(DB_PATH)

.PHONY: clean-dashboard
clean-dashboard:
	@echo "Cleaning dashboard artifacts..."
	rm -rf $(DASHBOARD_DIR)/dist
	rm -rf $(DASHBOARD_DIR)/node_modules
	rm -rf $(DATA_DIR)/*

.PHONY: clean
clean: clean-dbt clean-dashboard
	@echo "All artifacts cleaned"

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  init              - Initialize project directories and check environment"
	@echo "  dev               - Start development environment"
	@echo "  build             - Build project for production"
	@echo "  deploy-gh-pages   - Prepare deployment for GitHub Pages"
	@echo "  clean             - Clean all built artifacts"
	@echo "  help              - Show this help message"