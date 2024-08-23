function manageAwsTrainingRecordings() {
  // Get folders and file by name (using next() might throw errors if not found)
  const meetRecordingsFolder = DriveApp.getFoldersByName('YOUR GOOGLE MEET RECORDING FOLDER').next();
  const awsFolder = DriveApp.getFoldersByName('YOUR FOLDER NAME').next();
  const csvFile = DriveApp.getFilesByName('YOUR CSV NAME.EXT').next();

  // Handle cases where folders or file are not found
  if (!meetRecordingsFolder || !awsFolder || !csvFile) {
    Logger.log('Error: Could not find necessary folders or file.');
    return;
  }

  // Get email addresses from CSV
  const fileContent = csvFile.getBlob().getDataAsString();
  const emailAddresses = fileContent.split('\n').map(line => line.trim()).filter(email => email.length > 0);

  // Get files and target date
  const files = meetRecordingsFolder.getFiles();
  const targetDate = new Date('2024-08-19');

  while (files.hasNext()) {
    const file = files.next();
    const createdDate = file.getDateCreated();
    const fileName = file.getName();

    // Check for files created after target date and starting with YOUR ACTUAL EVENT NAME" (corrected name)
    if (createdDate >= targetDate && fileName.startsWith('YOUR FILE NAME')) {
      try {
        // Move file and add viewers
        file.moveTo(awsFolder);
        emailAddresses.forEach(email => file.addViewer(email));

        // Update calendar event description (using calendar ID)
        const calendarId = 'YOUR CALENDAR ID'; // Replace with your actual calendar ID
        const calendar = CalendarApp.getCalendarById(calendarId);

        if (calendar) {
          const events = calendar.getEventsForDay(new Date());
          for (const event of events) {
            if (event.getTitle().includes('YOUR EVENT TITLE')) {
              const description = event.getDescription();
              const newDescription = description + '\nRecording: ' + file.getUrl();
              event.setDescription(newDescription);
              break; // Update only the first matching event
            }
          }
        } else {
          Logger.log('Error: Could not retrieve calendar with ID: ' + calendarId);
        }
      } catch (error) {
        Logger.log('Error processing file: ' + fileName + ' - ' + error.message);
      }
    }
  }
}
