import React, { useContext } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Redirect } from "react-router-dom";

import { Context } from "../context/authContext";

const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter valid email")
    .required("Email address is required"),
  password: yup
    .string()
    .min(8, ({ min }) => `Password must be at least ${min} characters`)
    .required("Password is required"),
});

export default function SignIn() {
  const { signin, state } = useContext(Context);

  if (state.token) {
    return <Redirect to="/" />;
  }
  return (
    <Formik
      validationSchema={loginValidationSchema}
      initialValues={{ email: "", password: "" }}
      onSubmit={signin}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        isValid,
        isSubmitting,
      }) => (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "black" }}></Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
              />
              {errors.email && (
                <Typography
                  fontSize={16}
                  component="h1"
                  variant="h5"
                  color="#d32f2f"
                >
                  {errors.email}
                </Typography>
              )}
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && (
                <Typography
                  fontSize={16}
                  component="h1"
                  variant="h5"
                  color="#d32f2f"
                >
                  {errors.password}
                </Typography>
              )}
              {state.errMessage && (
                <Alert variant="standard" severity="error">
                  {state.errMessage}
                </Alert>
              )}
              <LoadingButton
                loading={isSubmitting}
                type="submit"
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={!isValid}
                sx={{ mt: 3, mb: 2 }}
              >
                Đăng nhập
              </LoadingButton>
            </Box>
          </Box>
        </Container>
      )}
    </Formik>
  );
}
