import os
import uuid
import numpy as np
import joblib

from django.conf import settings

# Fix for Matplotlib in Django (Headless mode)
import matplotlib
matplotlib.use("Agg")


class DataEngine:

    def __init__(self, file_path):

        import pandas as pd  # moved inside

        self.file_path = file_path
        self.df = pd.read_csv(file_path)
        self.report = []
        self.initial_score = 0
        self.final_score = 0


    def calculate_quality_score(self):

        score = 100
        total_cells = self.df.size
        total_rows = len(self.df)

        null_count = self.df.isnull().sum().sum()
        null_percent = (null_count / total_cells) * 100
        score -= null_percent * 2.0

        dup_count = self.df.duplicated().sum()
        dup_percent = (dup_count / total_rows) * 100
        score -= dup_percent * 2.0

        return max(int(score), 0)


    def generate_heatmap(self):

        import matplotlib.pyplot as plt
        import seaborn as sns

        numeric_df = self.df.select_dtypes(include=[np.number])

        if numeric_df.shape[1] < 2:
            return None

        plt.figure(figsize=(10, 8))
        sns.set(style="darkgrid")

        sns.heatmap(
            numeric_df.corr(),
            annot=True,
            cmap="coolwarm",
            fmt=".2f",
            linewidths=0.5
        )

        plt.title("Feature Correlation Matrix")
        plt.tight_layout()

        filename = f"heatmap_{uuid.uuid4().hex}.png"

        save_path = os.path.join(settings.MEDIA_ROOT, "plots")
        os.makedirs(save_path, exist_ok=True)

        full_path = os.path.join(save_path, filename)

        plt.savefig(full_path)
        plt.close()

        return f"/media/plots/{filename}"


    def get_distributions(self):

        numeric_cols = self.df.select_dtypes(include=[np.number]).columns[:4]
        dist_data = []

        for col in numeric_cols:

            counts, bins = np.histogram(self.df[col].dropna(), bins=10)

            chart_data = []

            for i in range(len(counts)):

                chart_data.append({
                    "name": f"{bins[i]:.1f}",
                    "value": int(counts[i])
                })

            dist_data.append({
                "column": col,
                "data": chart_data
            })

        return dist_data


    def train_model(self, target_col):

        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
        from sklearn.metrics import accuracy_score, r2_score

        X = self.df.drop(columns=[target_col])
        y = self.df[target_col]

        is_classification = y.nunique() < 20 or y.dtype == "object"

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        if is_classification:

            model = RandomForestClassifier(n_estimators=100)
            model.fit(X_train, y_train)

            preds = model.predict(X_test)

            score = accuracy_score(y_test, preds)
            metric_name = "Accuracy"

        else:

            model = RandomForestRegressor(n_estimators=100)
            model.fit(X_train, y_train)

            preds = model.predict(X_test)

            score = r2_score(y_test, preds)
            metric_name = "R2 Score"

        model_filename = f"model_{uuid.uuid4().hex}.pkl"

        save_path = os.path.join(settings.MEDIA_ROOT, "models")
        os.makedirs(save_path, exist_ok=True)

        joblib.dump(model, os.path.join(save_path, model_filename))

        return {
            "accuracy": round(score * 100, 2),
            "metric": metric_name,
            "type": "Classification" if is_classification else "Regression",
            "download_url": f"/media/models/{model_filename}"
        }


    def process(self):

        from sklearn.preprocessing import LabelEncoder

        initial_rows = len(self.df)
        initial_cols = len(self.df.columns)

        self.report.append(
            f"Loaded dataset with {initial_rows} rows and {initial_cols} columns."
        )

        self.initial_score = self.calculate_quality_score()

        dup_count = self.df.duplicated().sum()

        if dup_count > 0:

            self.df.drop_duplicates(inplace=True)

            self.report.append(
                f"Identified and removed {dup_count} duplicate rows."
            )

        else:
            self.report.append("No duplicate rows found.")

        null_counts = self.df.isnull().sum()

        if null_counts.sum() == 0:

            self.report.append(
                "Dataset is clean: No missing values detected."
            )

        else:

            for col in self.df.columns:

                count = null_counts[col]

                if count > 0:

                    pct = (count / initial_rows) * 100

                    if self.df[col].dtype == "object":

                        mode_val = self.df[col].mode()[0]

                        self.df[col] = self.df[col].fillna(mode_val)

                        self.report.append(
                            f"Column '{col}': Filled {count} missing values with Mode '{mode_val}'."
                        )

                    else:

                        mean_val = self.df[col].mean()

                        self.df[col] = self.df[col].fillna(mean_val)

                        self.report.append(
                            f"Column '{col}': Filled {count} missing values with Mean {mean_val:.2f}."
                        )

        for col in list(self.df.columns):

            if "id" in col.lower() and self.df[col].nunique() == len(self.df):

                self.df.drop(columns=[col], inplace=True)

                self.report.append(
                    f"Dropped column '{col}' (ID column)."
                )

        le = LabelEncoder()

        obj_cols = self.df.select_dtypes(include=["object"]).columns

        for col in obj_cols:

            unique_count = self.df[col].nunique()

            if unique_count < len(self.df) * 0.5:

                self.df[col] = le.fit_transform(
                    self.df[col].astype(str)
                )

                self.report.append(
                    f"Encoded column '{col}' with {unique_count} categories."
                )

        self.final_score = self.calculate_quality_score()

        self.report.append(
            f"Processing Complete. Final dataset shape: {self.df.shape}."
        )

        heatmap_url = self.generate_heatmap()
        distributions = self.get_distributions()

        filename = os.path.basename(self.file_path)

        name, ext = os.path.splitext(filename)

        new_filename = f"{name}_processed{ext}"

        output_path = os.path.join(settings.MEDIA_ROOT, new_filename)

        self.df.to_csv(output_path, index=False)

        return {
            "initial_score": self.initial_score,
            "final_score": self.final_score,
            "report": self.report,
            "download_url": f"/media/{new_filename}",
            "heatmap_url": heatmap_url,
            "distributions": distributions,
            "columns": list(self.df.columns)
        }