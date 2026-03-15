# Getting Started with Spring Boot in VS Code

This guide mirrors what VS Code prompts when you open the Spring Boot story view shown in the screenshot: the focus is on installing the extensions, creating a project with Spring Initializr, and trying the sample so you can immediately explore the Java tooling in the editor.

## 1. Install the Spring tooling
1. Open the Extensions view (`Ctrl+Shift+X`).
2. Search for **Spring Boot Extension Pack** and install it. That pack installs the **Extension Pack for Java**, debugger, Maven/Gradle helpers, and Spring-specific support.
3. After installation, reload the window if VS Code prompts you.

## 2. Start with a Spring Boot project
1. Open the command palette (`Ctrl+Shift+P`).
2. Run the **Spring Initializr: Generate a Maven/Gradle Project** command.
3. Choose the Java version (e.g., 17), build tool, packaging, and dependencies you need.
4. Pick a location for the project and wait for the initializer to download the template.
5. Once the generation completes, open the new folder in the workspace so the Spring Boot extension activates.

## 3. Try the Spring PetClinic sample
1. In the Spring Boot Dashboard, click **Spring PetClinic** under the Sample Projects section (if you don’t see it, search **Spring PetClinic sample** in the command palette and follow the prompts).
2. The sample project installs automatically and opens in its own workspace.
3. Explore the `src/main/java` files, then run the application by clicking the **Run** button next to `PetClinicApplication` or via **Run > Start Debugging**.

## 4. Daily workflow tips
- Use the **Spring Boot Dashboard** view to start/stop apps, view logs, and re-run with different profiles without leaving VS Code.
- Run `mvn spring-boot:run` or the Gradle equivalent directly from the terminal if you need manual control.
- Open `src/main/resources/application.properties` to adjust the server port before launching the app.

## 5. Optional: share the experience
If you want to keep the Spring Boot workflow prominent, add a short README section or workspace note that links to this doc so teammates can find the getting-started steps quickly.
