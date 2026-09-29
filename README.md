# Relief Camp Manager

Relief Camp Manager is a Spring Boot application for managing relief camps, family check-ins, camp inventory, and supply distributions. It serves a small browser-based interface and a JSON REST API from the same application.

## Features

- Create and manage camps, including capacity.
- Check families in, update their details, and check them out.
- Track camp inventory for food, water, and blankets.
- Record, edit, and view distributions to housed families.
- Enforce business rules such as camp capacity, available stock, and matching a family and supply to the same camp.

## Technology

- Java 21
- Spring Boot 4.1.1, Spring MVC, Spring Data JPA, and Hibernate
- MySQL
- Maven Wrapper
- Static HTML, CSS, and vanilla JavaScript

## Requirements

- JDK 21
- MySQL Server

The application is configured for MySQL at `localhost:3306`, using the `relief_camp_db` database. Create the database before starting the application:

```sql
CREATE DATABASE relief_camp_db;
```

The current credentials in `src/main/resources/application.properties` are `root` / `root`. Update that file to match your local MySQL account before running the application. Do not use these checked-in development credentials in a deployed environment.

Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update`, so it creates or updates tables after connecting to the database. It does not create the MySQL database itself.

## Run Locally

From the project root, start the application with the Maven Wrapper.

Windows PowerShell:

```powershell
./mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080) to use the web interface. The REST API is available under `/api` on the same host and port.

To build and run the tests:

```powershell
./mvnw.cmd test
./mvnw.cmd package
```

On macOS/Linux, use `./mvnw` instead of `./mvnw.cmd`. The current test suite checks that the Spring application context loads; it uses the configured database connection as part of application startup.

## REST API

Requests and responses use JSON unless otherwise noted. Controllers accept and return JPA entities directly.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/camps` | List camps |
| `POST` | `/api/camps` | Create a camp |
| `GET` | `/api/camps/{campId}` | Get a camp |
| `PUT` | `/api/camps/{campId}` | Update a camp |
| `DELETE` | `/api/camps/{campId}` | Delete an eligible camp |
| `GET` | `/api/camps/{campId}/families` | List housed families |
| `POST` | `/api/camps/{campId}/families` | Check in a family |
| `PUT` | `/api/camps/{campId}/families/{familyId}` | Update a family |
| `PUT` | `/api/camps/{campId}/families/{familyId}/checkout` | Check out a family |
| `DELETE` | `/api/camps/{campId}/families/{familyId}` | Delete a family without distribution history |
| `GET` | `/api/camps/{campId}/inventory` | List camp inventory |
| `POST` | `/api/camps/{campId}/supplies` | Receive stock into inventory |
| `PUT` | `/api/camps/{campId}/supplies/{supplyId}` | Update an inventory item |
| `DELETE` | `/api/camps/{campId}/supplies/{supplyId}` | Delete a supply without distribution history |
| `POST` | `/api/families/{familyId}/distributions/{supplyId}?quantity={n}` | Issue supply to a family |
| `GET` | `/api/camps/{campId}/distributions` | List distributions for a camp |
| `GET` | `/api/distributions/{distributionId}` | Get a distribution |
| `PUT` | `/api/distributions/{distributionId}` | Change a distribution quantity |
| `DELETE` | `/api/distributions/{distributionId}` | Delete a distribution and return stock |

Business rule violations and missing records are returned as HTTP errors. For example, a distribution requires a housed family, a supply from the same camp, a positive quantity, and sufficient stock.

## Data Model

- A camp has many families and supplies.
- A family has one camp and can have many distribution records.
- A supply has one camp and can have many distribution records.
- A distribution joins one family and one supply; its camp is derived from the supply.
- Each camp can have at most one supply record for each supply type. Supply types are `FOOD`, `WATER`, and `BLANKETS`.
- Family occupancy is calculated from housed families. Checking out a family retains its record and sets `housed` to false.

## Diagrams and Architecture

<p align="center">
	<img src="Database%20Schema%20Diagram.jpeg" alt="Entity relationship diagram" width="100%">
</p>

<p align="center">
	<img src="System%20Architecture%20Diagram.jpeg" alt="System architecture topology" width="100%">
</p>

See [ARCHITECTURE.md](ARCHITECTURE.md) for the component breakdown, business flows, configuration details, and current risks and recommendations.
