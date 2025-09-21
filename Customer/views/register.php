<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="this is an ecommerce project for making anis express"
    />
    <title>Ecommerce project</title>

    <!-- font awesome cdn  -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
      integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link rel="stylesheet" href="../css/style.css" />
    <link rel="stylesheet" href="../css/nav.css" />
    <link rel="stylesheet" href="../css/footer.css" />
  </head>
  <body>
    <!-- navbar starts here  -->
    <?php include '../layout/navbar.php'; ?>
    <!-- navbar ends here  -->
    <main>
      <section class="register">
        <h2 class="section-title text-center">User Registration</h2>
        <div class="card">
          <form action="" class="form">
            <div class="form-control flex-center">
              <label for="name">Name</label>
              <input type="text" id="name" required autocomplete="name" />
            </div>
            <div class="form-control flex-center">
              <label for="email">Email</label>
              <input type="email" id="email" required autocomplete="email" />
            </div>
            <div class="form-control flex-center">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                required
                autocomplete="password"
              />
            </div>
            <div class="form-control flex-center">
              <label for="about">About Me</label>
              <textarea name="about" id="about"></textarea>
            </div>
            <div class="form-control flex-center form-btn-field">
              <button type="submit" class="btn contact-btn">submit</button>
            </div>
          </form>
        </div>
      </section>
    </main>
    <!-- footer starts here  -->
    <?php include '../layout/footer.php'; ?>
    <!-- footer ends here  -->
    <script src="./scripts/index.js"></script>
  </body>
</html>
