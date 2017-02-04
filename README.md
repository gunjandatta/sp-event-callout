# SharePoint Calendar Event Callout
This project will demonstrate how to add a callout for each event in a SharePoint 2013/Online Calendar. The callout will display the event details.

# How To Use
Upload the script file to a SharePoint library. Edit a Calendar view page, and add a Script Editor webpart to the page. Add the following script to the page:
```
<script type="text/javascript" src="[url to the script file]"></script>
<script type="text/javascript">
    new SPEventCallout(["Calendar List Name"]);
</script>
```

# Reference
This project was created in reference to my blog post.